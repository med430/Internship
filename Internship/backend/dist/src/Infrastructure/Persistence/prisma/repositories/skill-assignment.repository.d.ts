import { PrismaService } from '../prisma.service';
import { SkillAssignmentMapper } from '../mappers/skill-assignment.mapper';
import { ISkillAssignmentRepository } from "../../../../Application/repositories/skill-assignment.repository";
import { SkillAssignment } from "../../../../Domain/entities/skill-assignment.entity";
import { GenericRepository } from "./generic.repositories";
import { SkillLevel } from "../../../../Domain/enums/skill-level.enum";
export declare class SkillAssignmentRepositoryImpl extends GenericRepository<SkillAssignment, any> implements ISkillAssignmentRepository {
    constructor(prisma: PrismaService, mapper: SkillAssignmentMapper);
    findByStudentAndSkill(studentProfileId: string, skillId: number): Promise<SkillAssignment | null>;
    updateLevel(id: string, level: SkillLevel): Promise<SkillAssignment>;
}
