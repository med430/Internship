import { User } from '../../../Domain/entities/user.entity';
import { QueryBus } from '@nestjs/cqrs';
import { Resolver, Args, Query } from '@nestjs/graphql';
import { GetUsersQuery } from '../../../Application/Features/UserFeature/Queries/get-users-query';
import { GetUserQuery } from "../../../Application/Features/UserFeature/Queries/get-user-query";

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly queryBus: QueryBus,
  ) {
  }

  @Query('users')
  async getUsers(): Promise<User[]> {
    return await this.queryBus.execute(new GetUsersQuery());
  }
}