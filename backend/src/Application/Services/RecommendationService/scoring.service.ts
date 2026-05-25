import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { StudentProfile } from '../../../Domain/entities/student-profile.entity'
import { Offer } from '../../../Domain/entities/offer.entity'
import { RecommendationScore } from '../../../Domain/entities/recommendation-score.entity'
import { ContentScoringService } from './content-scoring.service'
import { MlOfferScore } from './ml-client.interface'

@Injectable()
export class ScoringService {

    constructor(private readonly content: ContentScoringService) {}

    scorePair(
        student: StudentProfile,
        offer: Offer,
        ml: MlOfferScore | null,
        modelVersion: string,
    ): RecommendationScore {
        const { score: contentScore, breakdown } = this.content.score(student, offer)

        const semanticScore = ml?.semanticScore ?? 0
        const cfScore       = ml?.cfScore       ?? 0
        const finalScore    = this.blend(contentScore, ml)

        return new RecommendationScore(
            randomUUID(),
            student.id,
            offer.id,
            contentScore,
            finalScore,
            semanticScore,
            cfScore,
            modelVersion,
            new Date(),
            breakdown,
        )
    }

    blend(contentScore: number, ml: MlOfferScore | null): number {
        if (!ml) return contentScore
        if (ml.finalMlScore > 0) return ml.finalMlScore
        return 0.6 * contentScore + 0.4 * ml.semanticScore
    }
}
