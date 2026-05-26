import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { CoverLetter } from '../../../Domain/entities/coverletter.entity';
import { GetCoverLetterQuery } from '../../../Application/Features/CoverLetterFeature/Queries/get-cover-letter.query';
import { GetCoverLettersQuery } from '../../../Application/Features/CoverLetterFeature/Queries/get-cover-letters.query';
import { GetUserQuery } from '../../../Application/Features/UserFeature/Queries/get-user.query';
import { User } from '../../../Domain/entities/user.entity';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';

@Resolver('CoverLetter')
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.STUDENT, Role.ADMIN)
export class CoverletterResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('coverLetter')
  async getCoverLetter(@Args('id') id: string): Promise<CoverLetter | null> {
    return this.queryBus.execute(new GetCoverLetterQuery(id));
  }

  @Query('coverLetters')
  async getCoverLetters(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<CoverLetter[]> {
    return this.queryBus.execute(
      new GetCoverLettersQuery(pageNumber, pageSize),
    );
  }

  @ResolveField('student')
  async student(@Parent() coverLetter: CoverLetter): Promise<User | null> {
    return this.queryBus.execute(new GetUserQuery(coverLetter.studentId));
  }
}
