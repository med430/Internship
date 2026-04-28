// auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { LoginDto } from './dto/login.dto'
import { RegisterStudentDto } from './dto/register-student.dto'
import { RegisterRecruiterDto } from './dto/register-recruiter.dto'
import { LoginCommand } from '../../../Application/Features/AuthFeature/Commands/login.command'
import { RegisterStudentCommand } from '../../../Application/Features/AuthFeature/Commands/register-student.command'
import { RegisterRecruiterCommand } from '../../../Application/Features/AuthFeature/Commands/register-recruiter.command'

@Controller('auth')
export class AuthController {
    constructor(private commandBus: CommandBus) {}

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.commandBus.execute(
            new LoginCommand(dto.email, dto.password)
        )
    }

    @Post('register/student')
    registerStudent(@Body() dto: RegisterStudentDto) {
        return this.commandBus.execute(
            new RegisterStudentCommand(
                dto.email,
                dto.name,
                dto.lastname,
                dto.username,
                dto.password
            )
        )
    }

    @Post('register/recruiter')
    registerRecruiter(@Body() dto: RegisterRecruiterDto) {
        return this.commandBus.execute(
            new RegisterRecruiterCommand(
                dto.email,
                dto.name,
                dto.lastname,
                dto.username,
                dto.password,
                dto.company,
                dto.companyDescription,
                dto.website
            )
        )
    }
}