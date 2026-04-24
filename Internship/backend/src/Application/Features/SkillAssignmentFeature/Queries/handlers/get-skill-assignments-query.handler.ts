import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSkillAssignmentsQuery } from '../get-skill-assignments.query';
import { ISkillAssignmentRepository } from '../../../../repositories/skill-assignment.repository';
import { SkillAssignment } from '../../../../../Domain/entities/skill-assignment.entity';

@QueryHandler(GetSkillAssignmentsQuery)
export class GetSkillAssignmentsQueryHandler implements IQueryHandler<GetSkillAssignmentsQuery> {
  constructor(
    private readonly skillAssignmentRepository: ISkillAssignmentRepository,
  ) {
  }

  async execute(query: GetSkillAssignmentsQuery): Promise<SkillAssignment[]> {
    return this.skillAssignmentRepository.findPaginated(query.pageNumber, query.pageSize);
  }
}