import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException
} from '@nestjs/common'

import { WithdrawApplicationCommand } from '../withdraw-application.command'

import { IApplicationRepository } from '../../../../repositories/application.repository.'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'

import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'

@CommandHandler(WithdrawApplicationCommand)
export class WithdrawApplicationHandler
    implements ICommandHandler<WithdrawApplicationCommand>
{
    constructor(
        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(command: WithdrawApplicationCommand) {

        const { applicationId, userId } = command

        // 🔥 1. récupérer application
        const application = await this.appRepo.findById(applicationId)
        if (!application) {
            throw new NotFoundException('Application not found')
        }

        // 🔥 2. récupérer student profile
        const student = await this.studentRepo.findByUserId(userId)
        if (!student) {
            throw new ForbiddenException()
        }

        // 🔥 3. vérifier ownership
        if (application.studentId !== student.id) {
            throw new ForbiddenException('Not allowed')
        }

        // 🔥 4. vérifier status
        if (application.status !== ApplicationStatus.PENDING) {
            throw new BadRequestException('Cannot withdraw this application')
        }

        // 🔥 5. update status
        application.status = ApplicationStatus.WITHDRAWN

        return this.appRepo.update(application)
    }
}