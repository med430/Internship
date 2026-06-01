// Owns the per-student scoring pipeline: content-score offers → ask ML for the top-K candidates → blend → emit persistable rows.

import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { StudentProfile } from '../../../Domain/entities/student-profile.entity'
import { Offer } from '../../../Domain/entities/offer.entity'
import { RecommendationScore, ScoreBreakdown } from '../../../Domain/entities/recommendation-score.entity'
import { ContentScoringService } from './content-scoring.service'
import { IMlClient, MlOfferScore } from './ml-client.interface'

const ML_BATCH_LIMIT = 200
const CONTENT_ONLY_VERSION = 'content-only'
// Only the top-K offers by content score are shipped to the sidecar as the retrieval source —
// ranking never runs over the whole catalog. At today's ~117 offers this is effectively "all".
const CONTENT_CANDIDATE_LIMIT = 300

interface ContentResult {
    score: number
    breakdown: ScoreBreakdown
}

@Injectable()
export class ScoringService {

    constructor(
        private readonly content: ContentScoringService,
        @Inject(IMlClient) private readonly ml: IMlClient,
    ) {}

    // Single end-to-end pass for one student against every candidate offer. Used by the recompute handler.
    async scoreStudent(
        student: StudentProfile,
        offers: Offer[],
        modelVersion: string,
    ): Promise<RecommendationScore[]> {
        if (offers.length === 0) return []

        const contentByOffer = this.scoreContentForAll(student, offers)
        const mlByOffer = await this.fetchMlScores(student, contentByOffer)

        // Don't claim the ML model unless it actually scored this student. recommendJobs
        // returns null/empty on a sidecar or Qdrant failure, leaving every row content-only;
        // tagging those bge-m3-v1 makes content scores masquerade as semantic ones.
        const effectiveVersion = mlByOffer.size > 0 ? modelVersion : CONTENT_ONLY_VERSION

        return offers.map(offer =>
            this.assemble(student, offer, contentByOffer.get(offer.id)!, mlByOffer.get(offer.id) ?? null, effectiveVersion),
        )
    }

    // Reports the ML sidecar's current model version so callers can tag rows for auditing.
    async resolveModelVersion(): Promise<string> {
        const health = await this.ml.health()
        return health?.modelVersion ?? CONTENT_ONLY_VERSION
    }

    // Phase-gated blender: trust LambdaMART if it has spoken, otherwise mix content with semantic, otherwise content alone.
    blend(contentScore: number, ml: MlOfferScore | null): number {
        if (!ml) return contentScore
        if (ml.finalMlScore > 0) return ml.finalMlScore
        return 0.6 * contentScore + 0.4 * ml.semanticScore
    }

    // Pure-math pass that produces the local content score + per-dimension breakdown for every offer.
    private scoreContentForAll(student: StudentProfile, offers: Offer[]): Map<string, ContentResult> {
        return new Map(offers.map(o => [o.id, this.content.score(student, o)]))
    }

    // Ships the top-K content candidates to the sidecar (which looks up the student's stored
    // vector by id) and returns its per-offer response, keyed by offerId.
    private async fetchMlScores(
        student: StudentProfile,
        contentByOffer: Map<string, ContentResult>,
    ): Promise<Map<string, MlOfferScore>> {
        const contentCandidates = [...contentByOffer.entries()]
            .map(([offerId, result]) => ({ offerId, contentScore: result.score }))
            .sort((a, b) => b.contentScore - a.contentScore)
            .slice(0, CONTENT_CANDIDATE_LIMIT)

        const response = await this.ml.recommendJobs({
            studentId: student.userId,
            contentCandidates,
            limit: ML_BATCH_LIMIT,
        })
        return new Map(response?.map(m => [m.offerId, m]) ?? [])
    }

    // Assembles the persistable RecommendationScore row from the precomputed content + ML pieces.
    private assemble(
        student: StudentProfile,
        offer: Offer,
        content: ContentResult,
        ml: MlOfferScore | null,
        modelVersion: string,
    ): RecommendationScore {
        return new RecommendationScore(
            randomUUID(),
            student.userId,
            offer.id,
            content.score,
            this.blend(content.score, ml),
            ml?.semanticScore ?? 0,
            ml?.cfScore       ?? 0,
            modelVersion,
            new Date(),
            content.breakdown,
        )
    }
}