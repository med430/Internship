// Owns the per-student scoring pipeline: build text → ask ML → blend with local content scores → emit persistable rows.

import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { StudentProfile } from '../../../Domain/entities/student-profile.entity'
import { Offer } from '../../../Domain/entities/offer.entity'
import { RecommendationScore, ScoreBreakdown } from '../../../Domain/entities/recommendation-score.entity'
import { ContentScoringService } from './content-scoring.service'
import { IMlClient, MlOfferScore } from './ml-client.interface'

const ML_BATCH_LIMIT = 200

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

        return offers.map(offer =>
            this.assemble(student, offer, contentByOffer.get(offer.id)!, mlByOffer.get(offer.id) ?? null, modelVersion),
        )
    }

    // Reports the ML sidecar's current model version so callers can tag rows for auditing.
    async resolveModelVersion(): Promise<string> {
        const health = await this.ml.health()
        return health?.modelVersion ?? 'content-only'
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

    // Ships the student text + flat content-score map to the sidecar and returns its per-offer response, keyed.
    private async fetchMlScores(
        student: StudentProfile,
        contentByOffer: Map<string, ContentResult>,
    ): Promise<Map<string, MlOfferScore>> {
        const contentScores: Record<string, number> = {}
        for (const [offerId, result] of contentByOffer) contentScores[offerId] = result.score

        const response = await this.ml.recommendJobs({
            studentId: student.userId,
            studentText: this.buildStudentText(student),
            contentScores,
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

    // Free-text representation of the student we send to the sidecar for embedding lookup.
    private buildStudentText(s: StudentProfile): string {
        const skills = s.skills.map(sk => sk.skillId).join(',')
        const prefs = s.preferredDomains.join(',')
        const cities = s.preferredCities.join(',')
        const bio = s.bio ?? ''
        return `skills:${skills}|domains:${prefs}|cities:${cities}|year:${s.currentYear ?? ''}|prog:${s.currentProgram ?? ''}|${bio}`
    }
}