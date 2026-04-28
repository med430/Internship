// Commands/handlers/register-student.handler.ts
import { CommandHandler } from '@nestjs/cqrs'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import {ConflictException, Inject} from '@nestjs/common'
import { RegisterStudentCommand } from '../register-student.command'
import { IUserRepository } from '../../../../repositories/user.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { User } from '../../../../../Domain/entities/user.entity'
import { Role } from '../../../../../Domain/enums/role.enum'
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler'
import { RegisterResponseDTO } from '../../../../../API/http/auth/dto/register-response.dto'
import { StudentProfile } from '../../../../../Domain/entities/student-profile.entity'

@CommandHandler(RegisterStudentCommand)
export class RegisterStudentHandler extends GenericCommandHandler<
RegisterStudentCommand,
    User,
RegisterResponseDTO
> {
    constructor(
        @Inject(IUserRepository)
        private userRepo: IUserRepository,

        @Inject(IStudentProfileRepository)
        private studentProfileRepo: IStudentProfileRepository
    ) { super() }

    protected async map(command: RegisterStudentCommand): Promise<User> {
        const hashedPassword = await bcrypt.hash(command.password, 10)

        return new User(
            randomUUID(),
            command.email,
            command.name,
            command.lastname,
            command.username,
            hashedPassword,
            Role.STUDENT
        )
    }

    protected async persist(user: User): Promise<RegisterResponseDTO> {
        const existing = await this.userRepo.findByEmail(user.email)
        if (existing) throw new ConflictException('Email already in use')

        const savedUser = await this.userRepo.save(user)

        await this.studentProfileRepo.save(
            new StudentProfile(randomUUID(), savedUser.id)
        )

        return new RegisterResponseDTO(
            savedUser.id,
            savedUser.email,
            savedUser.username,
            savedUser.name,
            savedUser.lastname,
            savedUser.role
        )
    }
}