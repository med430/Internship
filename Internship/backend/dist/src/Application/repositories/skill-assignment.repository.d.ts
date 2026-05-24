import { SkillAssignment } from '../../Domain/entities/skill-assignment.entity';
import { IGenericRepository } from './generic.repository';
import { SkillLevel } from '../../Domain/enums/skill-level.enum';
export interface ISkillAssignmentRepository extends IGenericRepository<SkillAssignment> {
    findByStudentAndSkill(studentProfileId: string, skillId: number): Promise<SkillAssignment | null>;
    updateLevel(id: string, level: SkillLevel): Promise<SkillAssignment>;
}
export declare const ISkillAssignmentRepository: unique symbol;
