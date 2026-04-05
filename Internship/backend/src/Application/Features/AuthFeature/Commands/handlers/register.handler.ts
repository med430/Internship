import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {RegisterCommand} from "../register.command";
import {IUserRepository} from "../../../../repositories/user.repository";
import {User} from "../../../../../Domain/entities/user.entity";
import {Role} from "../../../../../Domain/enums/role.enum";
import {Inject} from "@nestjs/common";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(command: RegisterCommand): Promise<User> {
        const existingEmail = await this.userRepository.findByEmail(command.email);
        if (existingEmail) throw new Error('User already exists');

        const existingUsername = await this.userRepository.findByUsername(command.username);
        if (existingUsername) throw new Error('User already exists');

        const user = new User(
            crypto.randomUUID(),
            command.firstName,
            command.lastName,
            command.username,
            command.email,
            command.password,
            command.role
        );

        return this.userRepository.save(user);
    }
}