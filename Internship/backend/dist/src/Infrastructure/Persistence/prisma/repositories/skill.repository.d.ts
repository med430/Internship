import { PrismaService } from '../prisma.service';
import { Skill } from '../../../../Domain/entities/skill.entity';
import { SkillMapper } from '../mappers/skill.mapper';
import { ISkillRepository } from '../../../../Application/repositories/skill.repository';
export declare class SkillRepositoryImpl implements ISkillRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService, mapper: SkillMapper);
    findByIds(ids: number[]): Promise<Skill[]>;
    findByName(name: string): Promise<Skill | null>;
    findById(id: number): Promise<Skill | null>;
    findAll(): Promise<Skill[]>;
    findPaginated(pageNumber: number, pageSize: number): Promise<Skill[]>;
    save(entity: Skill): Promise<Skill>;
    delete(id: number): Promise<void>;
}
