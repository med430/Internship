import { Application } from '../../Domain/entities/application.entity'
import { IGenericRepository } from './generic.repository.interface'

export abstract class IApplicationRepository extends IGenericRepository<Application> {
    abstract findByStudent(studentId: string): Promise<Application[]>
    abstract findByOffer(offerId: string): Promise<Application[]>
}