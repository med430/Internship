
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'

import { SoftDeleteUserCommand } from '../soft-delete-user.command'
import { IUserRepository } from '../../../../repositories/user.repository'

@CommandHandler(SoftDeleteUserCommand)
export class SoftDeleteUserHandler
    implements ICommandHandler<SoftDeleteUserCommand>
{
    constructor(
        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(command: SoftDeleteUserCommand) {
        const user = await this.userRepo.findById(command.userId)
        if (!user) throw new NotFoundException()

        if (user.deletedAt) return // idempotent

        user.deletedAt = new Date()

        return this.userRepo.update(user)
    }
}