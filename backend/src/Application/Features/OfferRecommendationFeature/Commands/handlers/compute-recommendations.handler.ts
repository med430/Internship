// Orchestrator: loads active students × offers, fans scoring out to ScoringService, persists the rows.

import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ComputeRecommendationsCommand } from '../compute-recommendations.command'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecommendationScoreRepository } from '../../../../repositories/recommendation-score.repository'
import { ScoringService } from '../../../../Services/RecommendationService/scoring.service'
import { StudentProfile } from '../../../../../Domain/entities/student-profile.entity'
import { Offer } from '../../../../../Domain/entities/offer.entity'

const STUDENT_BATCH_SIZE = 50

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
        private readonly scoring: ScoringService,
    ) {}

    // Loads active students and offers, scores every pair in batches, upserts to the score table.
    async execute(cmd: ComputeRecommendationsCommand): Promise<ComputeResult> {
        const start = Date.now()
        const modelVersion = await this.scoring.resolveModelVersion()

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

    // Scores one batch of students in parallel, then upserts all their rows in one chunked write.
    private async processBatch(students: StudentProfile[], offers: Offer[], modelVersion: string): Promise<number> {
        const rowsPerStudent = await Promise.all(
            students.map(s => this.scoring.scoreStudent(s, offers, modelVersion)),
        )
        return this.scores.upsertMany(rowsPerStudent.flat())
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
}