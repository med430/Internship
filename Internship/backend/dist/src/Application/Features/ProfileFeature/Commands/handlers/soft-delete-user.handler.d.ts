import { SoftDeleteUserCommand } from '../soft-delete-user.command';
import { IUserRepository } from '../../../../repositories/user.repository';
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler';
export declare class SoftDeleteUserHandler extends GenericCommandHandler<SoftDeleteUserCommand, string, void> {
    private userRepo;
    constructor(userRepo: IUserRepository);
    protected map(command: SoftDeleteUserCommand): Promise<string>;
    protected persist(userId: string): Promise<void>;
}
