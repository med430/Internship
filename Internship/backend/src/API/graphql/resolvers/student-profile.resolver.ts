import { Query, Args, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { GetSkillAssignmentsQuery } from '../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignments.query';
import { GetSkillAssignmentQuery } from '../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignment.query';
import { StudentProfile } from '../../../Domain/entities/student-profile.entity';
import {
  GetStudentProfileQuery
} from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import {
  GetStudentProfilesQuery
} from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profiles.query';

@Resolver(StudentProfile)
export class SkillAssignmentResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('studentProfile')
  async getStudentProfile(
    @Args('id') id: string,
  ): Promise<StudentProfile | null> {
    return this.queryBus.execute(new GetStudentProfileQuery(id));
  }

  @Query('studentProfiles')
  async getStudentProfiles(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ) {
    return this.queryBus.execute(
      new GetStudentProfilesQuery(pageNumber, pageSize),
    );
  }
}
