import { PrismaService } from '../prisma.service';
import { EducationMapper } from '../mappers/education.mapper';
import { IEducationRepository } from "../../../../Application/repositories/education.repository";
import { GenericRepository } from "./generic.repositories";
import { Education } from "../../../../Domain/entities/education.entity";
export declare class EducationRepositoryImpl extends GenericRepository<Education, any> implements IEducationRepository {
    constructor(prisma: PrismaService, mapper: EducationMapper);
}
