import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';
import { Certification } from '../../../Domain/entities/certification.entity';
import { GetCertificationQuery } from '../../../Application/Features/CertificationFeature/Queries/get-certification.query';
import { GetCertificationsQuery } from '../../../Application/Features/CertificationFeature/Queries/get-certifications.query';
import { Application } from '../../../Domain/entities/application.entity';
import { User } from '../../../Domain/entities/user.entity';
import { Offer } from '../../../Domain/entities/offer.entity';
import { GetUserQuery } from '../../../Application/Features/UserFeature/Queries/get-user.query';
import { GetOfferQuery } from '../../../Application/Features/OfferFeature/Queries/get-offer.query';
import { GetCVQuery } from '../../../Application/Features/CvFeature/Queries/get-cv.query';
import { GetCoverLetterQuery } from '../../../Application/Features/CoverLetterFeature/Queries/get-cover-letter.query';
import { CV } from '../../../Domain/entities/cv.entity';
import { CoverLetter } from '../../../Domain/entities/coverletter.entity';
import {
  GetStudentProfileQuery
} from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import { StudentProfile } from '../../../Domain/entities/student-profile.entity';
import { Project } from '../../../Domain/entities/project.entity';

@Resolver('Certification')
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.STUDENT, Role.RECRUITER, Role.ADMIN)
export class CertificationResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('certification')
  async getCertification(
    @Args('id') id: string,
  ): Promise<Certification | null> {
    return this.queryBus.execute(new GetCertificationQuery(id));
  }

  @Query('certifications')
  async getCertifications(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Certification[]> {
    return this.queryBus.execute(
      new GetCertificationsQuery(pageNumber, pageSize),
    );
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
