// Application/repositories/skill-assignment.repository.ts
import { SkillAssignment } from '../../Domain/entities/skill-assignment.entity'
import { IGenericRepository } from './generic.repository'
import { SkillLevel } from '../../Domain/enums/skill-level.enum'

export abstract class ISkillAssignmentRepository extends IGenericRepository<SkillAssignment> {
  abstract findByStudentAndSkill(studentProfileId: string, skillId: number): Promise<SkillAssignment | null>
  abstract updateLevel(id: string, level: SkillLevel): Promise<SkillAssignment>
}