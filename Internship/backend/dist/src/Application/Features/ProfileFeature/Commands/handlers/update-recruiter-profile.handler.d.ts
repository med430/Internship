import { UpdateRecruiterProfileCommand } from '../update-recruiter-profile.command';
import { IUserRepository } from '../../../../repositories/user.repository';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler';
import { User } from '../../../../../Domain/entities/user.entity';
import { ProfileResponseDTO } from "../../../../../API/http/profile/dto/profile-response.dto";
type UpdateRecruiterContext = {
    user: User;
};
export declare class UpdateRecruiterProfileHandler extends GenericCommandHandler<UpdateRecruiterProfileCommand, UpdateRecruiterContext, ProfileResponseDTO> {
    private userRepo;
    private recruiterProfileRepo;
    constructor(userRepo: IUserRepository, recruiterProfileRepo: IRecruiterProfileRepository);
    protected map(command: UpdateRecruiterProfileCommand): Promise<UpdateRecruiterContext>;
    protected persist(ctx: UpdateRecruiterContext): Promise<ProfileResponseDTO>;
}
export {};
