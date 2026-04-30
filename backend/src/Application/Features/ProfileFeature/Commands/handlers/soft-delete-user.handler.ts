// Commands/handlers/soft-delete-user.handler.ts
import { CommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { SoftDeleteUserCommand } from '../soft-delete-user.command'
import { IUserRepository } from '../../../../repositories/user.repository'
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler'

@CommandHandler(SoftDeleteUserCommand)
export class SoftDeleteUserHandler extends GenericCommandHandler<
SoftDeleteUserCommand,
    string,
void
> {
    constructor(
        @Inject(IUserRepository)
        private userRepo: IUserRepository,
    ) { super() }

    protected async map(command: SoftDeleteUserCommand): Promise<string> {
        const user = await this.userRepo.findById(command.userId)
        if (!user) throw new NotFoundException('User not found')
        return command.userId
    }

    protected async persist(userId: string): Promise<void> {
        await this.userRepo.softDelete(userId)
    }
}