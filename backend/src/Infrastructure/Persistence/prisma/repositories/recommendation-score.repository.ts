import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { RecommendationScoreMapper } from '../mappers/recommendation-score.mapper'
import { IRecommendationScoreRepository } from '../../../../Application/repositories/recommendation-score.repository'
import { RecommendationScore } from '../../../../Domain/entities/recommendation-score.entity'
import { GenericRepository } from './generic.repositories'

@Injectable()
export class RecommendationScoreRepositoryImpl
    extends GenericRepository<RecommendationScore, any>
    implements IRecommendationScoreRepository {

    constructor(prisma: PrismaService, mapper: RecommendationScoreMapper) {
        super(prisma, 'recommendationScore', mapper)
    }

    async findTopForStudent(studentId: string, limit: number, offset = 0): Promise<RecommendationScore[]> {
        const rows = await this.prisma.recommendationScore.findMany({
            where: { studentId },
            orderBy: { finalScore: 'desc' },
            take: limit,
            skip: offset,
        })
        return rows.map(r => this.mapper.toDomain(r))
    }

    async findTopForOffer(offerId: string, limit: number, offset = 0): Promise<RecommendationScore[]> {
        const rows = await this.prisma.recommendationScore.findMany({
            where: { offerId },
            orderBy: { finalScore: 'desc' },
            take: limit,
            skip: offset,
        })
        return rows.map(r => this.mapper.toDomain(r))
    }

    async findByStudentAndOffer(studentId: string, offerId: string): Promise<RecommendationScore | null> {
        const row = await this.prisma.recommendationScore.findUnique({
            where: { studentId_offerId: { studentId, offerId } },
        })
        return row ? this.mapper.toDomain(row) : null
    }

    // Upserts in parallel chunks; no transaction (scores are idempotent so partial writes are safe).
    async upsertMany(scores: RecommendationScore[]): Promise<number> {
        if (scores.length === 0) return 0

        const CHUNK_SIZE = 25
        for (let i = 0; i < scores.length; i += CHUNK_SIZE) {
            const chunk = scores.slice(i, i + CHUNK_SIZE)
            await Promise.all(chunk.map(s =>
                this.prisma.recommendationScore.upsert({
                    where: { studentId_offerId: { studentId: s.studentId, offerId: s.offerId } },
                    create: {
                        id:            s.id,
                        studentId:     s.studentId,
                        offerId:       s.offerId,
                        contentScore:  s.contentScore,
                        semanticScore: s.semanticScore,
                        cfScore:       s.cfScore,
                        finalScore:    s.finalScore,
                        breakdown:     (s.breakdown ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
                        modelVersion:  s.modelVersion,
                        computedAt:    s.computedAt,
                    },
                    update: {
                        contentScore:  s.contentScore,
                        semanticScore: s.semanticScore,
                        cfScore:       s.cfScore,
                        finalScore:    s.finalScore,
                        breakdown:     (s.breakdown ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
                        modelVersion:  s.modelVersion,
                        computedAt:    s.computedAt,
                    },
                })
            ))
        }
        return scores.length
    }

    async deleteByStudent(studentId: string): Promise<number> {
        const result = await this.prisma.recommendationScore.deleteMany({
            where: { studentId },
        })
        return result.count
    }
}
