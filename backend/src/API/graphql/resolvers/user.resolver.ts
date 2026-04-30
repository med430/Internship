import { User } from '../../../Domain/entities/user.entity';
import { QueryBus } from '@nestjs/cqrs';
import { Resolver, Args, Query } from '@nestjs/graphql';
import { GetUsersQuery } from '../../../Application/Features/UserFeature/Queries/get-users.query';
import { GetUserQuery } from "../../../Application/Features/UserFeature/Queries/get-user.query";

@Resolver('User')
export class UserResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('user')
  getUser(@Args('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Query('users')
  async getUsers(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<User[]> {
    return await this.queryBus.execute(new GetUsersQuery(pageNumber, pageSize));
  }
}