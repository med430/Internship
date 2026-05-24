import { Application as PrismaApplication } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { Application } from '../../../../Domain/entities/application.entity';
import { ApplicationStatus } from '../../../../Domain/enums/application-status.enum';
export declare class ApplicationMapper implements IGenericMapper<Application, PrismaApplication> {
    toDomain(raw: PrismaApplication): Application;
    toPersistence(domain: Application): {
        id: string;
        studentId: string;
        offerId: string;
        cvId: string;
        status: ApplicationStatus;
        matchScore: number;
        coverLetterId: string | null;
        deletedAt: Date | null;
    };
}
