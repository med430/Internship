
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { IUserRepository } from '../../../../repositories/user.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import {UpdateUserCommand} from "../update-user.command";

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
    constructor(
        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
    ) {}

    async execute(command: UpdateUserCommand) {
        const { userId, dto } = command

        const user = await this.userRepo.findById(userId)
        if (!user) throw new NotFoundException('User not found')
        if (user.deletedAt) throw new ForbiddenException('User deleted')

        // 🔥 UPDATE USER
        if (dto.name !== undefined) user.name = dto.name
        if (dto.lastname !== undefined) user.lastname = dto.lastname
        if (dto.username !== undefined) user.username = dto.username

        if (dto.password) {
            user.passwordHash = await bcrypt.hash(dto.password, 10)
        }

        await this.userRepo.update(user)

        // 🔥 UPDATE PROFILE SELON ROLE
        if (user.role === 'RECRUITER' && dto.company !== undefined) {
            const profile = await this.recruiterRepo.findDomainByUserId(userId)
            if (profile) {
                profile.company = dto.company
                await this.recruiterRepo.update(profile)
            }
        }

        if (user.role === 'STUDENT' && dto.bio !== undefined) {
            const profile = await this.studentRepo.findByUserId(userId)
            if (profile) {
                profile.bio = dto.bio
                await this.studentRepo.update(profile)
            }
        }

        return { message: 'Profile updated successfully' }
    }
}