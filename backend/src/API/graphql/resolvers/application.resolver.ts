import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';
import { Application } from '../../../Domain/entities/application.entity';
import { GetApplicationQuery } from '../../../Application/Features/ApplicationFeature/Queries/get-application.query';
import { GetApplicationsQuery } from '../../../Application/Features/ApplicationFeature/Queries/get-applications.query';
import { GetStudentProfileQuery } from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import { GetUserQuery } from '../../../Application/Features/UserFeature/Queries/get-user.query';
import { GetOfferQuery } from '../../../Application/Features/OfferFeature/Queries/get-offer.query';
import { GetCVQuery } from '../../../Application/Features/CvFeature/Queries/get-cv.query';
import { User } from '../../../Domain/entities/user.entity';
import { Offer } from '../../../Domain/entities/offer.entity';
import { CV } from '../../../Domain/entities/cv.entity';
import { CoverLetter } from '../../../Domain/entities/coverletter.entity';
import { GetCoverLetterQuery } from '../../../Application/Features/CoverLetterFeature/Queries/get-cover-letter.query';

@Resolver('Application')
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.STUDENT, Role.RECRUITER, Role.ADMIN)
export class ApplicationResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('application')
  async getApplication(@Args('id') id: string): Promise<Application | null> {
    return this.queryBus.execute(new GetApplicationQuery(id));
  }

  @Query('applications')
  async getApplications(
    @Args('pageNumber') pageNumber: number = 1,
    @Args('pageSize') pageSize: number = 200,
  ): Promise<Application[]> {
    try {
      const result = await this.queryBus.execute(
        new GetApplicationsQuery(pageNumber, pageSize),
      );

      return result ?? [];
    } catch (error) {
      console.error('[GraphQL] applications query failed', error);
      return [];
    }
  }

  @ResolveField('student')
  async student(@Parent() application: Application): Promise<User | null> {
    const profile = await this.queryBus.execute(
      new GetStudentProfileQuery(application.studentId),
    );

    if (!profile) return null;

    return this.queryBus.execute(new GetUserQuery(profile.userId));
  }

  @ResolveField('offer')
  async offer(@Parent() application: Application): Promise<Offer | null> {
    return this.queryBus.execute(new GetOfferQuery(application.offerId));
  }

  @ResolveField('cv')
  async cv(@Parent() application: Application): Promise<CV | null> {
    return this.queryBus.execute(new GetCVQuery(application.cvId));
  }

  @ResolveField('coverLetter')
  async coverLetter(
    @Parent() application: Application,
  ): Promise<CoverLetter | null> {
    if (!application.coverLetterId) return null;
    return this.queryBus.execute(
      new GetCoverLetterQuery(application.coverLetterId),
    );
  }
}
