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
    source: 'recommendation' | 'newest-fallback'
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
