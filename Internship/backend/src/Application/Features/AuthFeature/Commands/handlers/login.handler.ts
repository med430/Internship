import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {LoginCommand} from "../login.command";
import {User} from "../../../../../Domain/entities/user.entity";
import * as bcrypt from "bcrypt";
import { IUserRepository } from '../../../../repositories/user.repository';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(command: LoginCommand): Promise<User> {
        const user = await this.userRepository.findByUsername(command.username);
        if (!user) throw new Error('Invalid Error');

        const isPasswordValid = await bcrypt.compare(
            command.password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        return user;
    }
}