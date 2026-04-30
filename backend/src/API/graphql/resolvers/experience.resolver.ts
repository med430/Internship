import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { Experience } from '../../../Domain/entities/experience.entity';
import { GetExperienceQuery } from '../../../Application/Features/ExperienceFeature/Queries/get-experience.query';
import { GetExperiencesQuery } from '../../../Application/Features/ExperienceFeature/Queries/get-experiences.query';
import {
  GetStudentProfileQuery
} from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import { StudentProfile } from '../../../Domain/entities/student-profile.entity';

@Resolver('Experience')
export class ExperienceResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('experience')
  async getExperience(@Args('id') id: string): Promise<Experience | null> {
    return this.queryBus.execute(new GetExperienceQuery(id));
  }

  @Query('experiences')
  async getExperiences(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Experience[]> {
    return this.queryBus.execute(new GetExperiencesQuery(pageNumber, pageSize));
  }

  @ResolveField('studentProfile')
  async studentProfile(
    @Parent() entity: Experience /* or Education, Certification */,
  ): Promise<StudentProfile | null> {
    return this.queryBus.execute(
      new GetStudentProfileQuery(entity.studentProfileId),
    );
  }
}
