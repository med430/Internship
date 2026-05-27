import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { Education } from '../../../Domain/entities/education.entity';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';
import { GetEducationQuery } from '../../../Application/Features/EducationFeature/Queries/get-education.query';
import { GetEducationsQuery } from '../../../Application/Features/EducationFeature/Queries/get-educations.query';
import {
  GetStudentProfileQuery
} from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import { StudentProfile } from '../../../Domain/entities/student-profile.entity';
import { Project } from '../../../Domain/entities/project.entity';

@Resolver('Education')
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.STUDENT, Role.RECRUITER, Role.ADMIN)
export class EducationResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('education')
  async getEducation(@Args('id') id: string): Promise<Education | null> {
    return this.queryBus.execute(new GetEducationQuery(id));
  }

  @Query('educations')
  async getEducations(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Education[]> {
    return this.queryBus.execute(new GetEducationsQuery(pageNumber, pageSize));
  }

  @ResolveField('studentProfile')
  async studentProfile(
    @Parent() project: Project,
  ): Promise<StudentProfile | null> {
    return this.queryBus.execute(
      new GetStudentProfileQuery(project.studentProfileId),
    );
  }
}
