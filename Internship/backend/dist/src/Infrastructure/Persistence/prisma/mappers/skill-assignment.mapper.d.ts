import { SkillAssignment as PrismaSkillAssignment } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { SkillAssignment } from "../../../../Domain/entities/skill-assignment.entity";
export declare class SkillAssignmentMapper implements IGenericMapper<SkillAssignment, PrismaSkillAssignment> {
    toDomain(raw: PrismaSkillAssignment): SkillAssignment;
    toPersistence(domain: SkillAssignment): {
        id: string;
        skillId: number;
        studentProfileId: string;
        level: any;
    };
}
