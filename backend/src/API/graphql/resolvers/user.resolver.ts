import { User } from '../../../Domain/entities/user.entity';
import { QueryBus } from '@nestjs/cqrs';
import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GetUsersQuery } from '../../../Application/Features/UserFeature/Queries/get-users.query';
import { GetUserQuery } from "../../../Application/Features/UserFeature/Queries/get-user.query";
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlRolesGuard } from '../guards/gql-roles.guard';
import { Roles } from '../../http/decorators/roles.decorator';
import { Role } from '../../../Domain/enums/role.enum';

@Resolver('User')
@UseGuards(GqlAuthGuard, GqlRolesGuard)
@Roles(Role.ADMIN)
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