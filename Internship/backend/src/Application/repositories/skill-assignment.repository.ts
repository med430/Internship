import { IGenericRepository } from './generic.repository';
import { SkillAssignment } from '../../Domain/entities/skill-assignment.entity';

export abstract class ISkillAssignmentRepository extends IGenericRepository<SkillAssignment> {
  abstract findByStudent(studentId: string): Promise<SkillAssignment[]>;
}