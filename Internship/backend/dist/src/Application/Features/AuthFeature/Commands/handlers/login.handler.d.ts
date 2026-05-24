import { LoginCommand } from '../login.command';
import { IUserRepository } from '../../../../repositories/user.repository';
import { AuthService } from '../../../../Services/AuthService/AuthService';
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler';
import { User } from '../../../../../Domain/entities/user.entity';
export declare class LoginHandler extends GenericCommandHandler<LoginCommand, User, {
    token: string;
}> {
    private userRepo;
    private authService;
    constructor(userRepo: IUserRepository, authService: AuthService);
    protected map(command: LoginCommand): Promise<User>;
    protected persist(user: User): Promise<{
        token: string;
    }>;
}
