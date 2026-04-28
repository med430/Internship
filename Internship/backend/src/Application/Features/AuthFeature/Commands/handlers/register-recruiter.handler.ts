// Commands/handlers/register-recruiter.handler.ts
import { CommandHandler } from '@nestjs/cqrs'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { Inject } from '@nestjs/common'
import { RegisterRecruiterCommand } from '../register-recruiter.command'
import { IUserRepository } from '../../../../repositories/user.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import { User } from '../../../../../Domain/entities/user.entity'
import { Role } from '../../../../../Domain/enums/role.enum'
import { RecruiterProfile } from '../../../../../Domain/entities/recruiter-profile.entity'
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler'
import { RegisterResponseDTO } from '../../../../../API/http/auth/dto/register-response.dto'

@CommandHandler(RegisterRecruiterCommand)
export class RegisterRecruiterHandler extends GenericCommandHandler<
RegisterRecruiterCommand,
    User,
RegisterResponseDTO
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

protected async persist(user: User): Promise<RegisterResponseDTO> {
    const savedUser = await this.userRepo.save(user)

    await this.recruiterProfileRepo.save(
        new RecruiterProfile(
            randomUUID(),
            savedUser.id,
            this._command.company,
            this._command.companyDescription,
            this._command.website
        )
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