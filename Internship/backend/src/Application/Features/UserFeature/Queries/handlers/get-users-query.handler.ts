import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../get-users.query';
import { User } from '../../../../../Domain/entities/user.entity';
import { IUserRepository } from '../../../../repositories/user.repository';

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: GetUsersQuery): Promise<User[]> {
    return this.userRepository.findPaginated(query.pageNumber, query.pageSize);
  }
}