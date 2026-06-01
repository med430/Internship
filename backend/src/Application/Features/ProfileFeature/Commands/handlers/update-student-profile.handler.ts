// Commands/handlers/update-student-profile.handler.ts
import { CommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { UpdateStudentProfileCommand } from '../update-student-profile.command'
import { IUserRepository } from '../../../../repositories/user.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { GenericCommandHandler } from '../../../GenericFeature/Commands/handlers/generic-command.handler'
import { PrismaService } from '../../../../../Infrastructure/Persistence/prisma/prisma.service'

import { User } from '../../../../../Domain/entities/user.entity'
import {ProfileResponseDTO} from "../../../../../API/http/profile/dto/profile-response.dto";

type UpdateStudentContext = { user: User }

@CommandHandler(UpdateStudentProfileCommand)
export class UpdateStudentProfileHandler extends GenericCommandHandler<
UpdateStudentProfileCommand,
    UpdateStudentContext,
ProfileResponseDTO
> {
    constructor(
        @Inject(IUserRepository)
        private userRepo: IUserRepository,

        @Inject(IStudentProfileRepository)
        private studentProfileRepo: IStudentProfileRepository,

        private readonly prisma: PrismaService,
    ) { super() }

    protected async map(command: UpdateStudentProfileCommand): Promise<UpdateStudentContext> {
        const user = await this.userRepo.findById(command.userId)
        if (!user) throw new NotFoundException('User not found')

        const profile = await this.studentProfileRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException('Student profile not found')

        // Update User fields
        user.name        = command.name        ?? user.name
        user.lastname    = command.lastname    ?? user.lastname
        user.username    = command.username    ?? user.username
        user.phone       = command.phone       ?? user.phone
        user.avatarUrl   = command.avatarUrl   ?? user.avatarUrl

        // Update StudentProfile fields
        profile.bio       = command.bio       ?? profile.bio
        profile.birthDate = command.birthDate
            ? new Date(command.birthDate)
            : profile.birthDate
        profile.gender    = command.gender    ?? profile.gender
        profile.address   = command.address   ?? profile.address
        profile.city      = command.city      ?? profile.city
        profile.domains   = command.domains   ?? profile.domains

        // School + recommendation preferences. `null` from the client means "clear it"; `undefined` means "leave alone".
        if (command.schoolId          !== undefined) profile.schoolId          = command.schoolId          ?? undefined
        if (command.currentYear       !== undefined) profile.currentYear       = command.currentYear       ?? undefined
        if (command.currentProgram    !== undefined) profile.currentProgram    = command.currentProgram    ?? undefined
        if (command.preferredCities)                 profile.preferredCities     = command.preferredCities
        if (command.preferredDomains)                profile.preferredDomains    = command.preferredDomains
        if (command.preferredOfferTypes)             profile.preferredOfferTypes = command.preferredOfferTypes
        if (command.preferredWorkMode !== undefined) profile.preferredWorkMode = command.preferredWorkMode ?? undefined
        if (command.languages)                       profile.languages           = command.languages
        if (command.paidOnly          !== undefined) profile.paidOnly          = command.paidOnly
        if (command.availableFrom     !== undefined) profile.availableFrom     = command.availableFrom     ?? undefined
        if (command.availableTo       !== undefined) profile.availableTo       = command.availableTo       ?? undefined

        await this.studentProfileRepo.update(profile)

        return { user }
    }

    protected async persist(ctx: UpdateStudentContext): Promise<ProfileResponseDTO> {
        const savedUser = await this.userRepo.update(ctx.user)

        // Sync display fields to publicSessionProfile so the services layout nav
        // (UserNav) reflects name/avatar/email changes after router.refresh()
        await this.prisma.publicSessionProfile.updateMany({
            where: { sessionKey: savedUser.id },
            data: {
                name:      savedUser.name      ?? '',
                email:     savedUser.email     ?? null,
                avatarUrl: savedUser.avatarUrl ?? null,
            },
        })

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