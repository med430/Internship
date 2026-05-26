import { Query, Args, Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';
import { GetSkillAssignmentsQuery } from '../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignments.query';
import { GetSkillAssignmentQuery } from '../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignment.query';
import { StudentProfile } from '../../../Domain/entities/student-profile.entity';
import {
  GetStudentProfileQuery
} from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import {
  GetStudentProfilesQuery
} from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profiles.query';
import { GetUserQuery } from '../../../Application/Features/UserFeature/Queries/get-user.query';
import { User } from '../../../Domain/entities/user.entity';

@Resolver(StudentProfile)
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.STUDENT, Role.RECRUITER, Role.ADMIN)
export class StudentProfileResolver {
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

  @ResolveField('user')
  async user(@Parent() profile: StudentProfile): Promise<User | null> {
    return this.queryBus.execute(new GetUserQuery(profile.userId));
  }
}
