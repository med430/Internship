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
import { RegisterResult } from '../register-result'
import { StudentProfile } from '../../../../../Domain/entities/student-profile.entity'

@CommandHandler(RegisterStudentCommand)
export class RegisterStudentHandler extends GenericCommandHandler<
RegisterStudentCommand,
    User,
RegisterResult
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

    protected async persist(user: User): Promise<RegisterResult> {
        const existing = await this.userRepo.findByEmail(user.email)
        if (existing) throw new ConflictException('Email already in use')

        const usernameTaken = await this.userRepo.findByUsername(user.username)
        if (usernameTaken) throw new ConflictException('Username already in use')

        let savedUser: User
        try {
            savedUser = await this.userRepo.save(user)
        } catch (error: any) {
            if (error?.code === 'P2002' || error?.cause?.originalCode === '23505') {
                const fields = Array.isArray(error?.meta?.target)
                    ? error.meta.target.join(', ')
                    : Array.isArray(error?.cause?.constraint?.fields)
                        ? error.cause.constraint.fields.join(', ')
                        : 'email or username'

                throw new ConflictException(`${fields} already in use`)
            }

            throw error
        }

        await this.studentProfileRepo.save(
            new StudentProfile(randomUUID(), savedUser.id)
        )

        return new RegisterResult(
            savedUser.id,
            savedUser.email,
            savedUser.username,
            savedUser.name,
            savedUser.lastname,
            savedUser.role
        )
    }
}