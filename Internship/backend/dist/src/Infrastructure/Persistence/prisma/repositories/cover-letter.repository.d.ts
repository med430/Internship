import { PrismaService } from '../prisma.service';
import { CoverLetterMapper } from '../mappers/cover-letter.mapper';
import { ICoverLetterRepository } from "../../../../Application/repositories/coverletter.repository";
import { CoverLetter } from "../../../../Domain/entities/coverletter.entity";
import { GenericRepository } from "./generic.repositories";
export declare class CoverLetterRepositoryImpl extends GenericRepository<CoverLetter, any> implements ICoverLetterRepository {
    constructor(prisma: PrismaService, mapper: CoverLetterMapper);
    findByStudent(studentId: string): Promise<CoverLetter[]>;
}
