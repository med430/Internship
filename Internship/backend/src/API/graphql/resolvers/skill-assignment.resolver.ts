import { Query, Args, Resolver } from '@nestjs/graphql';
import { SkillAssignment } from '../../../Domain/entities/skill-assignment.entity';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetSkillAssignmentsQuery
} from '../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignments.query';
import { GetSkillAssignmentQuery} from '../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignment.query';

@Resolver(SkillAssignment)
export class SkillAssignmentResolver {
  constructor(private readonly queryBus: QueryBus) {
  }

  @Query('skillAssignment')
  async getSkillAssignment(@Args('id') id: string): Promise<SkillAssignment | null> {
    return this.queryBus.execute(new GetSkillAssignmentQuery(id));
  }

  @Query('skillAssignments')
  async getSkillAssignments(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
    ) {
    return this.queryBus.execute(new GetSkillAssignmentsQuery(pageNumber, pageSize));
  }
}