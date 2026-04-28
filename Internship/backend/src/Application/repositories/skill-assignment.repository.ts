
import { IGenericRepository } from './generic.repository';
import { SkillAssignment } from '../../Domain/entities/skill-assignment.entity';
import {SkillLevel} from "../../Domain/enums/skill-level.enum";

export abstract class ISkillAssignmentRepository extends IGenericRepository<SkillAssignment> {
  abstract findByStudentAndSkill(studentProfileId: string, skillId: number): Promise<SkillAssignment | null>;
  abstract updateLevel(id: string, level: SkillLevel): Promise<SkillAssignment>;
}