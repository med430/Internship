import { CommandBus } from '@nestjs/cqrs';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterRecruiterDto } from './dto/register-recruiter.dto';
export declare class AuthController {
    private commandBus;
    constructor(commandBus: CommandBus);
    login(dto: LoginDto): Promise<any>;
    registerStudent(dto: RegisterStudentDto): Promise<any>;
    registerRecruiter(dto: RegisterRecruiterDto): Promise<any>;
}
