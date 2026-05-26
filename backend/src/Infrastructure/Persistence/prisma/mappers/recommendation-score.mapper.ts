import { Injectable } from '@nestjs/common'
import { Prisma, RecommendationScore as PrismaRecommendationScore } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { RecommendationScore, ScoreBreakdown } from '../../../../Domain/entities/recommendation-score.entity'

@Injectable()
export class RecommendationScoreMapper implements IGenericMapper<RecommendationScore, PrismaRecommendationScore> {
    toDomain(raw: PrismaRecommendationScore): RecommendationScore {
        return new RecommendationScore(
            raw.id,
            raw.studentId,
            raw.offerId,
            raw.contentScore,
            raw.finalScore,
            raw.semanticScore,
            raw.cfScore,
            raw.modelVersion,
            raw.computedAt,
            (raw.breakdown as ScoreBreakdown | null) ?? undefined,
        )
    }

    toPersistence(domain: RecommendationScore): PrismaRecommendationScore {
        return {
            id:            domain.id,
            studentId:     domain.studentId,
            offerId:       domain.offerId,
            contentScore:  domain.contentScore,
            semanticScore: domain.semanticScore,
            cfScore:       domain.cfScore,
            finalScore:    domain.finalScore,
            breakdown:     (domain.breakdown ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
            modelVersion:  domain.modelVersion,
            computedAt:    domain.computedAt,
        } as PrismaRecommendationScore
    }
}
