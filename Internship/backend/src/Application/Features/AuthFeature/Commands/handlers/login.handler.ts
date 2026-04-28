// Commands/handlers/login.handler.ts
import { CommandHandler } from '@nestjs/cqrs'
import * as bcrypt from 'bcrypt'
import { Inject, UnauthorizedException } from '@nestjs/common'
import { LoginCommand } from '../login.command'
import { IUserRepository } from '../../../../repositories/user.repository'
import { AuthService } from '../../../../Services/AuthService/AuthService'
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler'
import { User } from '../../../../../Domain/entities/user.entity'

@CommandHandler(LoginCommand)
export class LoginHandler extends GenericCommandHandler<LoginCommand, User, { token: string }> {
    constructor(
        @Inject(IUserRepository)
        private userRepo: IUserRepository,
        private authService: AuthService
    ) { super() }

    protected async map(command: LoginCommand): Promise<User> {
        const user = await this.userRepo.findByEmail(command.email)
        if (!user) throw new UnauthorizedException()

        const isMatch = await bcrypt.compare(command.password, user.passwordHash)
        if (!isMatch) throw new UnauthorizedException()

        return user
    }

    protected async persist(user: User): Promise<{ token: string }> {
        const token = await this.authService.createJwtToken(
            user.username,
            [user.role],
            user.id
        )
        return { token }
    }
}