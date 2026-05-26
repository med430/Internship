import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { UpdateUserRoleCommand } from '../update-user-role.command'
import { IUserRepository } from '../../../../repositories/user.repository'
import { User } from '../../../../../Domain/entities/user.entity'

@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler implements ICommandHandler<UpdateUserRoleCommand> {
    constructor(
        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(command: UpdateUserRoleCommand): Promise<User> {
        const user = await this.userRepo.findById(command.userId)
        if (!user) throw new NotFoundException('User not found')
        user.role = command.role
        return this.userRepo.update(user)
    }
}
