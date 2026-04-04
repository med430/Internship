import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {LoginCommand} from "../login.command";
import {IUserRepository} from "../../../../Intrerfaces/user.repository.interface";
import {User} from "../../../../../Domain/user.entity";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(command: LoginCommand): Promise<User> {
        const user = await this.userRepository.findByUsername(command.username);
        if (!user) throw new Error('Invalid Error');

        if (!user.password || user.password !== command.password) throw new Error('Invalid Password');

        return user;
    }
}