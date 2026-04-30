import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'          // ← ajouter
import { GetUserQuery } from '../get-user.query'
import { IUserRepository } from '../../../../repositories/user.repository'
import { User } from '../../../../../Domain/entities/user.entity'

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(
      @Inject(IUserRepository)                     // ← ajouter
      private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<User | null> {
    return this.userRepository.findById(query.id)
  }
}