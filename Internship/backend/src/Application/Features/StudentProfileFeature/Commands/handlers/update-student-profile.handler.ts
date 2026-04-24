import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException
} from '@nestjs/common'

import { UpdateStudentProfileCommand } from '../update-student-profile.command'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { IUserRepository } from '../../../../repositories/user.repository'

@CommandHandler(UpdateStudentProfileCommand)
export class UpdateStudentProfileHandler
    implements ICommandHandler<UpdateStudentProfileCommand>
{
    constructor(
        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository
    ) {}

    async execute(command: UpdateStudentProfileCommand) {

        const { userId, bio } = command

        // 🔒 vérifier user
        const user = await this.userRepo.findById(userId)
        if (!user || user.role !== 'STUDENT') {
            throw new ForbiddenException()
        }

        // 🔥 récupérer profile
        const profile = await this.studentRepo.findByUserId(userId)

        if (!profile) {
            throw new NotFoundException('Student profile not found')
        }

        // 🔥 update
        if (bio !== undefined) {
            profile.bio = bio
        }

        return await this.studentRepo.update(profile)
    }
}