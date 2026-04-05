import { Interview } from '../../Domain/entities/interview.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IInterviewRepository extends IGenericRepository<Interview> {
    abstract findByStudent(studentId: string): Promise<Interview[]>
    abstract findByOffer(offerId: string): Promise<Interview[]>
}