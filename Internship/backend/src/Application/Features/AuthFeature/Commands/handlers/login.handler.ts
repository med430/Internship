import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {LoginCommand} from "../login.command";
import {User} from "../../../../../Domain/entities/user.entity";
import * as bcrypt from "bcrypt";
import { IUserRepository } from '../../../../repositories/user.repository';
import { TokenDto } from '../../dto/token.dto';
import { IAuthService } from '../../../../Services/AuthService/IAuthService';
import { UnauthorizedException } from '@nestjs/common';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly authService: IAuthService,
    ) {}

    async execute(command: LoginCommand): Promise<TokenDto> {
        const user = await this.userRepository.findByUsername(command.username);
        if (!user) throw new UnauthorizedException('User not found');

        const isPasswordValid = await bcrypt.compare(
            command.password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = await this.authService.createJwtToken(user.username, user.role);

        return { token };
    }
}