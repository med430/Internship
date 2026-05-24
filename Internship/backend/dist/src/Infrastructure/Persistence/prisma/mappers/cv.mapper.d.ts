import { CV as PrismaCV } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { CV } from '../../../../Domain/entities/cv.entity';
export declare class CVMapper implements IGenericMapper<CV, PrismaCV> {
    toDomain(raw: PrismaCV): CV;
    toPersistence(domain: CV): {
        id: string;
        studentId: string;
        fileUrl: string;
        deletedAt: Date | null;
    };
}
