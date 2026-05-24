import { UpdateStudentProfileCommand } from '../update-student-profile.command';
import { IUserRepository } from '../../../../repositories/user.repository';
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository';
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler';
import { User } from '../../../../../Domain/entities/user.entity';
import { ProfileResponseDTO } from "../../../../../API/http/profile/dto/profile-response.dto";
type UpdateStudentContext = {
    user: User;
};
export declare class UpdateStudentProfileHandler extends GenericCommandHandler<UpdateStudentProfileCommand, UpdateStudentContext, ProfileResponseDTO> {
    private userRepo;
    private studentProfileRepo;
    constructor(userRepo: IUserRepository, studentProfileRepo: IStudentProfileRepository);
    protected map(command: UpdateStudentProfileCommand): Promise<UpdateStudentContext>;
    protected persist(ctx: UpdateStudentContext): Promise<ProfileResponseDTO>;
}
export {};
