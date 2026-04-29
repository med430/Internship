import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { Project } from '../../../Domain/entities/project.entity';
import { GetProjectQuery } from '../../../Application/Features/ProjectFeature/Queries/get-project.query';
import { GetProjectsQuery } from '../../../Application/Features/ProjectFeature/Queries/get-projects.query';
import {
  GetStudentProfileQuery
} from '../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query';
import { StudentProfile } from '../../../Domain/entities/student-profile.entity';

@Resolver('Project')
export class ProjectResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('project')
  async getProject(@Args('id') id: string): Promise<Project | null> {
    return this.queryBus.execute(new GetProjectQuery(id));
  }

  @Query('projects')
  async getProjects(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Project[]> {
    return this.queryBus.execute(new GetProjectsQuery(pageNumber, pageSize));
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
