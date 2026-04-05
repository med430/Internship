import { Recommendation } from '../../Domain/entities/recommendation.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IRecommendationRepository extends IGenericRepository<Recommendation> {
    abstract findByStudent(studentId: string): Promise<Recommendation[]>
    abstract findByTeacher(teacherId: string): Promise<Recommendation[]>
}