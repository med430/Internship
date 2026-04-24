import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import * as bcrypt from 'bcrypt'
import {Inject, UnauthorizedException} from '@nestjs/common'
import {LoginCommand} from "../login.command";
import {IUserRepository} from "../../../../repositories/user.repository";
import {AuthService} from "../../../../Services/AuthService/AuthService";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {

    constructor(
        @Inject(IUserRepository)
        private userRepo: IUserRepository,

        private authService: AuthService
    ) {}

    async execute(command: LoginCommand) {

        const user = await this.userRepo.findByEmail(command.email)
        if (!user) throw new UnauthorizedException()

        const isMatch = await bcrypt.compare(
            command.password,
            user.passwordHash
        )

        if (!isMatch) throw new UnauthorizedException()

        const token = await this.authService.createJwtToken(
            user.username,
            [user.role],
            user.id
        )

        return { token }
    }
}