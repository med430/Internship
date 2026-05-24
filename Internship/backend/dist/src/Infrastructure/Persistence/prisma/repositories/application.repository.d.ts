import { PrismaService } from '../prisma.service';
import { ApplicationMapper } from '../mappers/application.mapper';
import { GenericRepository } from "./generic.repositories";
import { Application } from "../../../../Domain/entities/application.entity";
import { IApplicationRepository } from "../../../../Application/repositories/application.repository";
export declare class ApplicationRepositoryImpl extends GenericRepository<Application, any> implements IApplicationRepository {
    constructor(prisma: PrismaService, mapper: ApplicationMapper);
    findByStudentAndOffer(studentId: string, offerId: string): Promise<Application | null>;
    findByStudent(studentId: string): Promise<Application[]>;
    findByOffer(offerId: string): Promise<Application[]>;
    rejectAllExcept(offerId: string, acceptedId: string): Promise<void>;
    existsByCvId(cvId: string): Promise<boolean>;
    existsByCoverLetterId(coverLetterId: string): Promise<boolean>;
}
