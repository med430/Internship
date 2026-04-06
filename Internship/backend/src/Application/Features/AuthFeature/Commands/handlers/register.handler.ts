import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {RegisterCommand} from "../register.command";
import {IUserRepository} from "../../../../repositories/user.repository";
import {User} from "../../../../../Domain/entities/user.entity";
import { Role } from '../../../../../Domain/enums/role.enum';
import { ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from "bcrypt";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(command: RegisterCommand): Promise<User> {
        const existingEmail = await this.userRepository.findByEmail(command.email);
        if (existingEmail) throw new ConflictException('User already exists');

        const existingUsername = await this.userRepository.findByUsername(command.username);
        if (existingUsername) throw new ConflictException('User already exists');

        const passwordHash = await bcrypt.hash(command.password, 10);

        const user = {
            id: crypto.randomUUID(),
            name: command.firstName,
            lastname: command.lastName,
            username: command.username,
            email: command.email,
            passwordHash: passwordHash,
            role: command.role
        } as User;

        return this.userRepository.save(user);
    }
}