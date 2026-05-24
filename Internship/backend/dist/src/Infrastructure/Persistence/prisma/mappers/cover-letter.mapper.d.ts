import { CoverLetter as PrismaCoverLetter } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { CoverLetter } from "../../../../Domain/entities/coverletter.entity";
export declare class CoverLetterMapper implements IGenericMapper<CoverLetter, PrismaCoverLetter> {
    toDomain(raw: PrismaCoverLetter): CoverLetter;
    toPersistence(domain: CoverLetter): Omit<PrismaCoverLetter, 'createdAt' | 'updatedAt'>;
}
