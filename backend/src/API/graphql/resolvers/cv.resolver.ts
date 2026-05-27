import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { CV } from '../../../Domain/entities/cv.entity';
import { GetCVQuery } from '../../../Application/Features/CvFeature/Queries/get-cv.query';
import { GetCVsQuery } from '../../../Application/Features/CvFeature/Queries/get-cvs.query';
import { GetStudentProfileQuery } from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import { GetUserQuery } from '../../../Application/Features/UserFeature/Queries/get-user.query';
import { User } from '../../../Domain/entities/user.entity';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';

@Resolver('CV')
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.STUDENT, Role.ADMIN)
export class CVResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('cv')
  async getCV(@Args('id') id: string): Promise<CV | null> {
    return this.queryBus.execute(new GetCVQuery(id));
  }

  @Query('cvs')
  async getCVs(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<CV[]> {
    return this.queryBus.execute(new GetCVsQuery(pageNumber, pageSize));
  }

  @ResolveField('student')
  async student(@Parent() cv: CV): Promise<User | null> {
    const profile = await this.queryBus.execute(
      new GetStudentProfileQuery(cv.studentId),
    );

    if (!profile) return null;

    return this.queryBus.execute(new GetUserQuery(profile.userId));
  }
}
