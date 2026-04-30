import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSkillAssignmentQuery } from '../get-skill-assignment.query';
import { ISkillAssignmentRepository } from '../../../../repositories/skill-assignment.repository';
import { SkillAssignment } from '../../../../../Domain/entities/skill-assignment.entity';

@QueryHandler(GetSkillAssignmentQuery)
export class GetSkillAssignmentQueryHandler implements IQueryHandler<GetSkillAssignmentQuery>  {
  constructor(
    private readonly skillAssignmentRepository: ISkillAssignmentRepository,
  ) {
  }

  async execute(query: GetSkillAssignmentQuery): Promise<SkillAssignment | null> {
    return this.skillAssignmentRepository.findById(query.id);
  }
}