import { Application } from '../../Domain/entities/application.entity'
import { IGenericRepository } from './generic.repository'

export interface IApplicationRepository extends IGenericRepository<Application> {
    findByStudent(studentId: string): Promise<Application[]>
    findByOffer(offerId: string): Promise<Application[]>
}