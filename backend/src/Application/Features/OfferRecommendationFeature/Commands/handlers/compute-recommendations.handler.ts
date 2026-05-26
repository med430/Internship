// Batch scorer: rebuilds the RecommendationScore table from current students × offers.

import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ComputeRecommendationsCommand } from '../compute-recommendations.command'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecommendationScoreRepository } from '../../../../repositories/recommendation-score.repository'
import { ScoringService } from '../../../../Services/RecommendationService/scoring.service'
import { ContentScoringService } from '../../../../Services/RecommendationService/content-scoring.service'
import { IMlClient } from '../../../../Services/RecommendationService/ml-client.interface'
import { StudentProfile } from '../../../../../Domain/entities/student-profile.entity'
import { Offer } from '../../../../../Domain/entities/offer.entity'
import { RecommendationScore } from '../../../../../Domain/entities/recommendation-score.entity'

const STUDENT_BATCH_SIZE = 50
const ML_BATCH_LIMIT = 200

export interface ComputeResult {
    studentsProcessed: number
    offersConsidered: number
    pairsWritten: number
    durationMs: number
    modelVersion: string
}

@CommandHandler(ComputeRecommendationsCommand)
export class ComputeRecommendationsHandler implements ICommandHandler<ComputeRecommendationsCommand> {
    private readonly logger = new Logger(ComputeRecommendationsHandler.name)

    constructor(
        @Inject(IStudentProfileRepository)      private readonly students: IStudentProfileRepository,
        @Inject(IOfferRepository)               private readonly offers:   IOfferRepository,
        @Inject(IRecommendationScoreRepository) private readonly scores:   IRecommendationScoreRepository,
        private readonly contentScoring: ContentScoringService,
        private readonly scoring:        ScoringService,
        @Inject(IMlClient)                      private readonly ml:       IMlClient,
    ) {}

    // Loads active students and offers, scores every pair in batches, upserts to the score table.
    async execute(cmd: ComputeRecommendationsCommand): Promise<ComputeResult> {
        const start = Date.now()
        const modelVersion = await this.resolveModelVersion()

        const activeOffers = (await this.offers.findAll()).filter(this.isActiveOffer)
        const allStudents = await this.loadStudents(cmd.studentUserId)

        let pairsWritten = 0
        for (let i = 0; i < allStudents.length; i += STUDENT_BATCH_SIZE) {
            const batch = allStudents.slice(i, i + STUDENT_BATCH_SIZE)
            pairsWritten += await this.processBatch(batch, activeOffers, modelVersion)
        }

        const result: ComputeResult = {
            studentsProcessed: allStudents.length,
            offersConsidered: activeOffers.length,
            pairsWritten,
            durationMs: Date.now() - start,
            modelVersion,
        }
        this.logger.log(`recompute done: ${JSON.stringify(result)}`)
        return result
    }

    // Scores one batch of students in parallel, then upserts all their rows in a single transaction.
    private async processBatch(students: StudentProfile[], offers: Offer[], modelVersion: string): Promise<number> {
        const rowsPerStudent = await Promise.all(
            students.map(s => this.scoreOneStudent(s, offers, modelVersion)),
        )
        const allRows = rowsPerStudent.flat()
        return this.scores.upsertMany(allRows)
    }

    // For one student: compute content scores for every offer, ask the ML sidecar for its scores, blend the two.
    private async scoreOneStudent(student: StudentProfile, offers: Offer[], modelVersion: string): Promise<RecommendationScore[]> {
        if (offers.length === 0) return []

        const contentScores: Record<string, number> = {}
        for (const offer of offers) {
            contentScores[offer.id] = this.contentScoring.score(student, offer).score
        }

        const mlResponse = await this.ml.recommendJobs({
            studentId: student.userId,
            studentText: this.buildStudentText(student),
            contentScores,
            limit: ML_BATCH_LIMIT,
        })
        const mlByOffer = new Map(mlResponse?.map(m => [m.offerId, m]) ?? [])

        return offers.map(offer => this.scoring.scorePair(student, offer, mlByOffer.get(offer.id) ?? null, modelVersion))
    }

    // Returns either every student profile, or just the one scoped by the command (for single-user reruns).
    private async loadStudents(studentUserId?: string): Promise<StudentProfile[]> {
        if (studentUserId) {
            const profile = await this.students.findByUserId(studentUserId)
            return profile ? [profile] : []
        }
        return this.students.findAll()
    }

    // An offer is in scope only if it's not soft-deleted and its application deadline (if any) hasn't passed.
    private isActiveOffer(o: Offer): boolean {
        if (o.deletedAt) return false
        if (!o.applicationDeadline) return true
        return o.applicationDeadline.getTime() > Date.now()
    }

    // Builds the free-text representation of the student we send to the ML sidecar for embedding lookup.
    private buildStudentText(s: StudentProfile): string {
        const skills = s.skills.map(sk => sk.skillId).join(',')
        const prefs = s.preferredDomains.join(',')
        const cities = s.preferredCities.join(',')
        const bio = s.bio ?? ''
        return `skills:${skills}|domains:${prefs}|cities:${cities}|year:${s.currentYear ?? ''}|prog:${s.currentProgram ?? ''}|${bio}`
    }

    // Tags every written row with the ML model's version so we can audit later which scores came from which model.
    private async resolveModelVersion(): Promise<string> {
        const health = await this.ml.health()
        return health?.modelVersion ?? 'content-only'
    }
}
