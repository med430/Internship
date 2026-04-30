import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetApplicationQuery } from '../get-application.query';
import { IApplicationRepository } from '../../../../repositories/application.repository';
import { Application } from '../../../../../Domain/entities/application.entity';

@QueryHandler(GetApplicationQuery)
export class GetApplicationQueryHandler implements IQueryHandler<GetApplicationQuery> {
  constructor(
    @Inject(IApplicationRepository)
    private readonly repository: IApplicationRepository,
  ) {}

  async execute(query: GetApplicationQuery): Promise<Application | null> {
    const result = await this.repository.findById(query.id);
    if (!result) throw new NotFoundException('Application not found');
    return result;
  }
}
