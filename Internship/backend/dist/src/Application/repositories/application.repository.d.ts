import { Application } from '../../Domain/entities/application.entity';
import { IGenericRepository } from './generic.repository';
export interface IApplicationRepository extends IGenericRepository<Application> {
    findByStudentAndOffer(studentId: string, offerId: string): Promise<Application | null>;
    findByStudent(studentId: string): Promise<Application[]>;
    findByOffer(offerId: string): Promise<Application[]>;
    rejectAllExcept(offerId: string, acceptedId: string): Promise<void>;
    existsByCvId(cvId: string): Promise<boolean>;
    existsByCoverLetterId(coverLetterId: string): Promise<boolean>;
}
export declare const IApplicationRepository: unique symbol;
