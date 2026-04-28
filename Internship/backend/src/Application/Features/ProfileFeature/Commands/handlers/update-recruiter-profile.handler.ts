// Commands/handlers/update-recruiter-profile.handler.ts
import { CommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { UpdateRecruiterProfileCommand } from '../update-recruiter-profile.command'
import { IUserRepository } from '../../../../repositories/user.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler'

import { User } from '../../../../../Domain/entities/user.entity'
import {ProfileResponseDTO} from "../../../../../API/http/profile/dto/profile-response.dto";

type UpdateRecruiterContext = { user: User }

@CommandHandler(UpdateRecruiterProfileCommand)
export class UpdateRecruiterProfileHandler extends GenericCommandHandler<
UpdateRecruiterProfileCommand,
    UpdateRecruiterContext,
ProfileResponseDTO
> {
    constructor(
        @Inject(IUserRepository)
        private userRepo: IUserRepository,

        @Inject(IRecruiterProfileRepository)
        private recruiterProfileRepo: IRecruiterProfileRepository
    ) { super() }

    protected async map(command: UpdateRecruiterProfileCommand): Promise<UpdateRecruiterContext> {
        const user = await this.userRepo.findById(command.userId)
        if (!user) throw new NotFoundException('User not found')

        const profile = await this.recruiterProfileRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException('Recruiter profile not found')

        // Update User fields
        user.name      = command.name      ?? user.name
        user.lastname  = command.lastname  ?? user.lastname
        user.username  = command.username  ?? user.username
        user.phone     = command.phone     ?? user.phone
        user.avatarUrl = command.avatarUrl ?? user.avatarUrl

        // Update RecruiterProfile fields
        profile.company            = command.company            ?? profile.company
        profile.companyDescription = command.companyDescription ?? profile.companyDescription
        profile.website            = command.website            ?? profile.website

        await this.recruiterProfileRepo.update(profile)

        return { user }
    }

    protected async persist(ctx: UpdateRecruiterContext): Promise<ProfileResponseDTO> {
        const savedUser = await this.userRepo.update(ctx.user)

        return new ProfileResponseDTO(
            savedUser.id,
            savedUser.email,
            savedUser.username,
            savedUser.name,
            savedUser.lastname,
            savedUser.role,
            savedUser.phone,
            savedUser.avatarUrl,
        )
    }
}