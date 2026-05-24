import { CommandBus } from '@nestjs/cqrs';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { UpdateRecruiterProfileDto } from './dto/update-recruiter-profile.dto';
export declare class ProfileController {
    private commandBus;
    constructor(commandBus: CommandBus);
    update(req: any, dto: UpdateStudentProfileDto | UpdateRecruiterProfileDto): Promise<any>;
    softDelete(req: any): Promise<any>;
}
