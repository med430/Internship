import { PrismaService } from '../prisma.service';
import { CVMapper } from '../mappers/cv.mapper';
import { GenericRepository } from "./generic.repositories";
import { CV } from "../../../../Domain/entities/cv.entity";
import { ICVRepository } from "../../../../Application/repositories/cv.repository";
export declare class CVRepositoryImpl extends GenericRepository<CV, any> implements ICVRepository {
    constructor(prisma: PrismaService, mapper: CVMapper);
    findByStudent(studentId: string): Promise<CV[]>;
}
