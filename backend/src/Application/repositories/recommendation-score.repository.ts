import { RecommendationScore } from '../../Domain/entities/recommendation-score.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IRecommendationScoreRepository extends IGenericRepository<RecommendationScore> {
    abstract findTopForStudent(studentId: string, limit: number, offset?: number): Promise<RecommendationScore[]>
    abstract findTopForOffer(offerId: string, limit: number, offset?: number): Promise<RecommendationScore[]>
    abstract findByStudentAndOffer(studentId: string, offerId: string): Promise<RecommendationScore | null>
    abstract upsertMany(scores: RecommendationScore[]): Promise<number>
    abstract deleteByStudent(studentId: string): Promise<number>
}
