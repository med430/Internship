// infrastructure/mappers/cover-letter.mapper.ts
import { Injectable } from '@nestjs/common'
import { CoverLetter as PrismaCoverLetter } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import {CoverLetter} from "../../../../Domain/entities/coverletter.entity";

@Injectable()
export class CoverLetterMapper implements IGenericMapper<CoverLetter, PrismaCoverLetter> {
    toDomain(raw: PrismaCoverLetter): CoverLetter {
        return new CoverLetter(
            raw.id,
            raw.studentId,
            raw.fileUrl,
            raw.createdAt,
            raw.updatedAt,
            raw.deletedAt ?? undefined,
        )
    }

    toPersistence(domain: CoverLetter): Omit<PrismaCoverLetter, 'createdAt' | 'updatedAt'> {
        return {
            id:        domain.id,
            studentId: domain.studentId,
            fileUrl:   domain.fileUrl,
            deletedAt: domain.deletedAt ?? null,
        }
    }
}