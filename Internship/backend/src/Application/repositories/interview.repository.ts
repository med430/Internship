import { Interview } from '../../Domain/entities/interview.entity'
import { IGenericRepository } from './generic.repository'

export interface IInterviewRepository extends IGenericRepository<Interview> {
    findByStudent(studentId: string): Promise<Interview[]>
    findByOffer(offerId: string): Promise<Interview[]>
}