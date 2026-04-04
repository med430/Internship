import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {RegisterCommand} from "../register.command";
import {IUserRepository} from "../../../../Intrerfaces/user.repository.interface";
import {User} from "../../../../../Domain/user.entity";

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
            command.username,
            command.email,
            command.password,
            'user'
        );

        return this.userRepository.save(user);
    }
}