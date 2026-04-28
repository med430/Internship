import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { Application } from '../../../Domain/entities/application.entity';
import { GetApplicationQuery } from '../../../Application/Features/ApplicationFeature/Queries/get-application.query';
import { GetApplicationsQuery } from '../../../Application/Features/ApplicationFeature/Queries/get-applications.query';

@Resolver('Application')
export class ApplicationResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('application')
  async getApplication(@Args('id') id: string): Promise<Application | null> {
    return this.queryBus.execute(new GetApplicationQuery(id));
  }

  @Query('applications')
  async getApplications(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Application[]> {
    return this.queryBus.execute(new GetApplicationsQuery(pageNumber, pageSize));
  }
}
