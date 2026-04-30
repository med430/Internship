// infrastructure/mappers/certification.mapper.ts
import { Injectable } from '@nestjs/common'
import { Certification as PrismaCertification } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import {Certification} from "../../../../Domain/entities/certification.entity";

@Injectable()
export class CertificationMapper implements IGenericMapper<Certification, PrismaCertification> {
    toDomain(raw: PrismaCertification): Certification {
        return new Certification(
            raw.id,
            raw.studentProfileId,
            raw.name,
            raw.organization,
            raw.issueDate,
            raw.expirationDate ?? undefined,
            raw.credentialId   ?? undefined,
            raw.credentialUrl  ?? undefined,
            raw.createdAt,
            raw.updatedAt,
            raw.deletedAt      ?? undefined,
        )
    }

    toPersistence(domain: Certification): Omit<PrismaCertification, 'createdAt' | 'updatedAt'> {
        return {
            id:               domain.id,
            studentProfileId: domain.studentProfileId,
            name:             domain.name,
            organization:     domain.organization,
            issueDate:        domain.issueDate,
            expirationDate:   domain.expirationDate ?? null,
            credentialId:     domain.credentialId   ?? null,
            credentialUrl:    domain.credentialUrl  ?? null,
            deletedAt:        domain.deletedAt      ?? null,
        }
    }
}