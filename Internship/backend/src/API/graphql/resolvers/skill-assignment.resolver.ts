import { Query, Args, Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { SkillAssignment } from '../../../Domain/entities/skill-assignment.entity';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetSkillAssignmentsQuery
} from '../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignments.query';
import { GetSkillAssignmentQuery} from '../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignment.query';
import { GetSkillQuery } from '../../../Application/Features/SkillFeature/Queries/get-skill.query';
import { Skill } from '../../../Domain/entities/skill.entity';
import {
  GetStudentProfileQuery
} from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import { StudentProfile } from '../../../Domain/entities/student-profile.entity';

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

  @ResolveField('skill')
  async skill(@Parent() sa: SkillAssignment): Promise<Skill | null> {
    return this.queryBus.execute(new GetSkillQuery(sa.skillId.toString()));
  }

  @ResolveField('studentProfile')
  async studentProfile(@Parent() sa: SkillAssignment): Promise<StudentProfile | null> {
    return this.queryBus.execute(new GetStudentProfileQuery(sa.studentProfileId));
  }
}