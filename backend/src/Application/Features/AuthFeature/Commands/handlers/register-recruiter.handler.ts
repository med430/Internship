// Commands/handlers/register-recruiter.handler.ts
import { CommandHandler } from '@nestjs/cqrs'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { RegisterRecruiterCommand } from '../register-recruiter.command'
import { IUserRepository } from '../../../../repositories/user.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import { User } from '../../../../../Domain/entities/user.entity'
import { Role } from '../../../../../Domain/enums/role.enum'
import { RecruiterProfile } from '../../../../../Domain/entities/recruiter-profile.entity'
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler'
import { RegisterResult } from '../register-result'
import { Inject, ConflictException } from '@nestjs/common'  // ← ajouter ConflictException

@CommandHandler(RegisterRecruiterCommand)
export class RegisterRecruiterHandler extends GenericCommandHandler<
RegisterRecruiterCommand,
    User,
RegisterResult
> {
    private _command: RegisterRecruiterCommand

constructor(
    @Inject(IUserRepository)
private userRepo: IUserRepository,

@Inject(IRecruiterProfileRepository)
private recruiterProfileRepo: IRecruiterProfileRepository
) { super() }

protected async map(command: RegisterRecruiterCommand): Promise<User> {
    this._command = command

    const hashedPassword = await bcrypt.hash(command.password, 10)

    return new User(
        randomUUID(),
        command.email,
        command.name,
        command.lastname,
        command.username,
        hashedPassword,
        Role.RECRUITER
    )
}

protected async persist(user: User): Promise<RegisterResult> {
    // ← ajouter
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

    await this.recruiterProfileRepo.save(
        new RecruiterProfile(
            randomUUID(),
            savedUser.id,
            this._command.company,
            this._command.companyDescription,
            this._command.website
        )
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