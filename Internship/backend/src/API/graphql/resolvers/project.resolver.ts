import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { Project } from '../../../Domain/entities/project.entity';
import { GetProjectQuery } from '../../../Application/Features/ProjectFeature/Queries/get-project.query';
import { GetProjectsQuery } from '../../../Application/Features/ProjectFeature/Queries/get-projects.query';

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
}
