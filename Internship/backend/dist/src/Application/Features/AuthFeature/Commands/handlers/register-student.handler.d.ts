import { RegisterStudentCommand } from '../register-student.command';
import { IUserRepository } from '../../../../repositories/user.repository';
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository';
import { User } from '../../../../../Domain/entities/user.entity';
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler';
import { RegisterResponseDTO } from '../../../../../API/http/auth/dto/register-response.dto';
export declare class RegisterStudentHandler extends GenericCommandHandler<RegisterStudentCommand, User, RegisterResponseDTO> {
    private userRepo;
    private studentProfileRepo;
    constructor(userRepo: IUserRepository, studentProfileRepo: IStudentProfileRepository);
    protected map(command: RegisterStudentCommand): Promise<User>;
    protected persist(user: User): Promise<RegisterResponseDTO>;
}
