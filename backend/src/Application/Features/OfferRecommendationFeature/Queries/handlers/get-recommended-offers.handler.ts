// Builds the student's offer feed: pre-computed scores when available, newest active offers as fallback.

import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { GetRecommendedOffersQuery } from '../get-recommended-offers.query'
import { IRecommendationScoreRepository } from '../../../../repositories/recommendation-score.repository'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IOfferViewRepository } from '../../../../repositories/offer-view.repository'
import { IOfferBookmarkRepository } from '../../../../repositories/offer-bookmark.repository'
import { decodeCursor, encodeCursor, FeedCursor } from '../../cursor'
import { Offer } from '../../../../../Domain/entities/offer.entity'
import { RecommendationScore } from '../../../../../Domain/entities/recommendation-score.entity'

const RANKED_FEED_CANDIDATE_LIMIT = 200

export interface RecommendedOfferDto {
    offer: Offer
    score: number
    breakdown?: Record<string, number | undefined>
    bookmarked: boolean
}

export interface RecommendedOffersPage {
    items: RecommendedOfferDto[]
    nextCursor: string | null
    source: 'recommendation' | 'newest-fallback' | 'explore'
}

@QueryHandler(GetRecommendedOffersQuery)
export class GetRecommendedOffersHandler implements IQueryHandler<GetRecommendedOffersQuery> {

    constructor(
        @Inject(IRecommendationScoreRepository) private readonly scores:    IRecommendationScoreRepository,
        @Inject(IOfferRepository)               private readonly offers:    IOfferRepository,
        @Inject(IOfferViewRepository)           private readonly views:     IOfferViewRepository,
        @Inject(IOfferBookmarkRepository)       private readonly bookmarks: IOfferBookmarkRepository,
    ) {}

    // Entry point: decide between "we have scores → ranked feed" and "no scores → newest fallback".
    async execute(query: GetRecommendedOffersQuery): Promise<RecommendedOffersPage> {
        const limit = Math.max(1, Math.min(query.limit ?? 20, 50))
        const cursor = decodeCursor(query.cursor)

        if (query.savedOnly) {
            return this.bookmarkedFeed(query.studentUserId, limit, cursor)
        }

        if (query.explore) {
            return this.exploreFeed(query.studentUserId, limit, cursor, query.exploreSeed)
        }

        const scores = await this.scores.findTopForStudent(query.studentUserId, RANKED_FEED_CANDIDATE_LIMIT)

        if (scores.length === 0) {
            return this.newestFallback(query.studentUserId, limit, cursor)
        }

        return this.rankedFeed(query.studentUserId, scores, limit, cursor)
    }

    // Ranked path: load offers for the score rows, re-rank in-memory with freshness/viewed/deadline/bookmark modifiers.
    private async rankedFeed(
        studentUserId: string,
        scoreRows: RecommendationScore[],
        limit: number,
        cursor: FeedCursor | null,
    ): Promise<RecommendedOffersPage> {
        const offerIds = scoreRows.map(s => s.offerId)
        const offers = await this.loadOffersByIds(offerIds)
        const bookmarkedIds = await this.getBookmarkedOfferIds(studentUserId, offerIds)
        const viewCounts = await this.views.countByStudent(studentUserId)

        // Pair scores with their offer, drop missing/deleted/expired offers
        const pairs = scoreRows
            .map(s => ({ score: s, offer: offers.get(s.offerId) }))
            .filter((p): p is { score: RecommendationScore; offer: Offer } =>
                !!p.offer && !p.offer.deletedAt && this.notPastDeadline(p.offer),
            )

        // Apply real-time modifiers to the score the frontend receives, so the visible match order stays descending.
        const adjusted = pairs.map(({ score, offer }) => ({
            offer,
            score: this.adjustScore(score, offer, bookmarkedIds.has(offer.id), viewCounts.get(offer.id) ?? 0),
            breakdown: score.breakdown,
            bookmarked: bookmarkedIds.has(offer.id),
        }))
        adjusted.sort((a, b) => b.score - a.score || (a.offer.id < b.offer.id ? 1 : -1))

        // Apply cursor (start AFTER the cursor's score and id)
        const startIdx = cursor
            ? adjusted.findIndex(x => x.score < cursor.score || (x.score === cursor.score && x.offer.id < cursor.id))
            : 0
        const slice = adjusted.slice(Math.max(0, startIdx), Math.max(0, startIdx) + limit)
        const last = slice[slice.length - 1]
        const nextCursor = slice.length === limit && last ? encodeCursor({ score: last.score, id: last.offer.id }) : null

        return { items: slice, nextCursor, source: 'recommendation' }
    }

    // No scores yet for this student: return active offers ordered newest-first as a graceful fallback.
    private async newestFallback(
        studentUserId: string,
        limit: number,
        cursor: FeedCursor | null,
    ): Promise<RecommendedOffersPage> {
        const all = await this.offers.findAll()
        const active = all
            .filter(o => !o.deletedAt && this.notPastDeadline(o))
            .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))

        const bookmarkedIds = await this.getBookmarkedOfferIds(studentUserId, active.map(o => o.id))

        // Newest-fallback uses the createdAt timestamp as the "score" surface for cursor continuity
        const items = active.map(o => ({
            offer: o,
            score: o.createdAt?.getTime() ?? 0,
            breakdown: undefined,
            bookmarked: bookmarkedIds.has(o.id),
        }))

        const startIdx = cursor
            ? items.findIndex(x => x.score < cursor.score || (x.score === cursor.score && x.offer.id < cursor.id))
            : 0
        const slice = items.slice(Math.max(0, startIdx), Math.max(0, startIdx) + limit)
        const last = slice[slice.length - 1]
        const nextCursor = slice.length === limit && last ? encodeCursor({ score: last.score, id: last.offer.id }) : null

        return { items: slice, nextCursor, source: 'newest-fallback' }
    }

    // Offers tab: explore ranking, not personal match ranking. It mixes freshness, popularity,
    // per-student view fatigue, deadline urgency, bookmarks, and a stable seeded shuffle.
    private async exploreFeed(
        studentUserId: string,
        limit: number,
        cursor: FeedCursor | null,
        seed: number,
    ): Promise<RecommendedOffersPage> {
        const all = await this.offers.findAll()
        const active = all.filter(o => !o.deletedAt && this.notPastDeadline(o))
        const offerIds = active.map(o => o.id)
        const [bookmarkedIds, viewCounts, globalViewCounts] = await Promise.all([
            this.getBookmarkedOfferIds(studentUserId, offerIds),
            this.views.countByStudent(studentUserId),
            this.views.countByOffers(offerIds),
        ])
        const maxGlobalViews = Math.max(1, ...Array.from(globalViewCounts.values()))

        const items = active
            .map(offer => ({
                offer,
                score: this.exploreScore(
                    offer,
                    bookmarkedIds.has(offer.id),
                    viewCounts.get(offer.id) ?? 0,
                    globalViewCounts.get(offer.id) ?? 0,
                    maxGlobalViews,
                    seed,
                ),
                breakdown: undefined,
                bookmarked: bookmarkedIds.has(offer.id),
            }))
            .sort((a, b) => b.score - a.score || (a.offer.id < b.offer.id ? 1 : -1))

        const startIdx = cursor
            ? items.findIndex(x => x.score < cursor.score || (x.score === cursor.score && x.offer.id < cursor.id))
            : 0
        const slice = items.slice(Math.max(0, startIdx), Math.max(0, startIdx) + limit)
        const last = slice[slice.length - 1]
        const nextCursor = slice.length === limit && last ? encodeCursor({ score: last.score, id: last.offer.id }) : null

        return { items: slice, nextCursor, source: 'explore' }
    }

    // Saved tab: active bookmarks only, reusing the same JobDocument mapper as the main feed.
    private async bookmarkedFeed(
        studentUserId: string,
        limit: number,
        cursor: FeedCursor | null,
    ): Promise<RecommendedOffersPage> {
        const bookmarks = await this.bookmarks.findActiveByStudent(studentUserId)
        if (bookmarks.length === 0) {
            return { items: [], nextCursor: null, source: 'recommendation' }
        }

        const offerIds = bookmarks.map(b => b.offerId)
        const [offers, scoreRows, viewCounts] = await Promise.all([
            this.loadOffersByIds(offerIds),
            this.scores.findTopForStudent(studentUserId, RANKED_FEED_CANDIDATE_LIMIT),
            this.views.countByStudent(studentUserId),
        ])
        const scoreByOfferId = new Map(scoreRows.map(s => [s.offerId, s]))

        const items: RecommendedOfferDto[] = bookmarks
            .flatMap(bookmark => {
                const offer = offers.get(bookmark.offerId)
                if (!offer || offer.deletedAt || !this.notPastDeadline(offer)) return []

                const score = scoreByOfferId.get(offer.id)
                return [{
                    offer,
                    score: score
                        ? this.adjustScore(score, offer, true, viewCounts.get(offer.id) ?? 0)
                        : 0,
                    ...(score?.breakdown ? { breakdown: score.breakdown } : {}),
                    bookmarked: true,
                }]
            })
            .sort((a, b) => b.score - a.score || (a.offer.id < b.offer.id ? 1 : -1))

        const startIdx = cursor
            ? items.findIndex(x => x.score < cursor.score || (x.score === cursor.score && x.offer.id < cursor.id))
            : 0
        const slice = items.slice(Math.max(0, startIdx), Math.max(0, startIdx) + limit)
        const last = slice[slice.length - 1]
        const nextCursor = slice.length === limit && last ? encodeCursor({ score: last.score, id: last.offer.id }) : null

        return { items: slice, nextCursor, source: 'recommendation' }
    }

    // Real-time score adjustment — fresher offers, less-viewed offers, urgent deadlines float up; bookmarked offers get a small bump.
    private adjustScore(
        score: RecommendationScore,
        offer: Offer,
        isBookmarked: boolean,
        viewCount: number,
    ): number {
        const ageDays = offer.createdAt ? (Date.now() - offer.createdAt.getTime()) / 86_400_000 : 0
        const freshness = Math.max(0.5, Math.exp(-ageDays / 14))

        const deadlineUrgency = this.deadlineFactor(offer.applicationDeadline)
        const bookmarkBoost = isBookmarked ? 0.1 : 0

        // Demote offers the student already viewed 3+ times without acting on them.
        const viewedPenalty = viewCount >= 3 ? 0.8 : 1.0

        return clamp01(score.finalScore * freshness * viewedPenalty * deadlineUrgency + bookmarkBoost)
    }

    private exploreScore(
        offer: Offer,
        isBookmarked: boolean,
        viewCount: number,
        globalViewCount: number,
        maxGlobalViews: number,
        seed: number,
    ): number {
        const ageDays = offer.createdAt ? (Date.now() - offer.createdAt.getTime()) / 86_400_000 : 0
        const freshness = Math.max(0.35, Math.exp(-ageDays / 21))
        const popularity = Math.log1p(globalViewCount) / Math.log1p(maxGlobalViews)
        const viewedPenalty = viewCount >= 3 ? 0.65 : viewCount > 0 ? 0.85 : 1.0
        const deadlineUrgency = this.deadlineFactor(offer.applicationDeadline)
        const bookmarkBoost = isBookmarked ? 0.05 : 0
        const seededNoise = deterministicNoise(`${seed}:${offer.id}`)

        return clamp01(
            (0.55 * freshness + 0.25 * popularity + 0.08 * seededNoise)
            * viewedPenalty
            * deadlineUrgency
            + bookmarkBoost,
        )
    }

    // ×1.2 if deadline is within 3 days, ×1.0 otherwise (or unknown).
    private deadlineFactor(deadline?: Date): number {
        if (!deadline) return 1.0
        const daysLeft = (deadline.getTime() - Date.now()) / 86_400_000
        return daysLeft > 0 && daysLeft < 3 ? 1.2 : 1.0
    }

    private notPastDeadline(o: Offer): boolean {
        return !o.applicationDeadline || o.applicationDeadline.getTime() > Date.now()
    }

    // Fetch all referenced offers in parallel and index by id for O(1) join.
    private async loadOffersByIds(ids: string[]): Promise<Map<string, Offer>> {
        const offers = await Promise.all(ids.map(id => this.offers.findById(id)))
        const map = new Map<string, Offer>()
        offers.forEach(o => o && map.set(o.id, o))
        return map
    }

    // Returns the set of offerIds the student has actively bookmarked (not removed). Used for the bookmark boost.
    private async getBookmarkedOfferIds(studentUserId: string, candidateIds: string[]): Promise<Set<string>> {
        if (candidateIds.length === 0) return new Set()
        const active = await this.bookmarks.findActiveByStudent(studentUserId)
        const candidateSet = new Set(candidateIds)
        return new Set(active.filter(b => candidateSet.has(b.offerId)).map(b => b.offerId))
    }
}

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value))
}

function deterministicNoise(input: string): number {
    let hash = 2166136261
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
    }
    return (hash >>> 0) / 0xffffffff
}
