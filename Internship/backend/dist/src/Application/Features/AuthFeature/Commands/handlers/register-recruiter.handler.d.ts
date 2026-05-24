import { RegisterRecruiterCommand } from '../register-recruiter.command';
import { IUserRepository } from '../../../../repositories/user.repository';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
import { User } from '../../../../../Domain/entities/user.entity';
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler';
import { RegisterResponseDTO } from '../../../../../API/http/auth/dto/register-response.dto';
export declare class RegisterRecruiterHandler extends GenericCommandHandler<RegisterRecruiterCommand, User, RegisterResponseDTO> {
    private userRepo;
    private recruiterProfileRepo;
    private _command;
    constructor(userRepo: IUserRepository, recruiterProfileRepo: IRecruiterProfileRepository);
    protected map(command: RegisterRecruiterCommand): Promise<User>;
    protected persist(user: User): Promise<RegisterResponseDTO>;
}
