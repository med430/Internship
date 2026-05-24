import { Certification as PrismaCertification } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { Certification } from "../../../../Domain/entities/certification.entity";
export declare class CertificationMapper implements IGenericMapper<Certification, PrismaCertification> {
    toDomain(raw: PrismaCertification): Certification;
    toPersistence(domain: Certification): Omit<PrismaCertification, 'createdAt' | 'updatedAt'>;
}
