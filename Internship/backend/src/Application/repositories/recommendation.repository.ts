import { Recommendation } from '../../Domain/entities/recommendation.entity'
import { IGenericRepository } from './generic.repository'

export interface IRecommendationRepository extends IGenericRepository<Recommendation> {
    findByStudent(studentId: string): Promise<Recommendation[]>
    findByTeacher(teacherId: string): Promise<Recommendation[]>
}