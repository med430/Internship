import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException
} from '@nestjs/common'

import { WithdrawApplicationCommand } from '../withdraw-application.command'

import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'

import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'
import {IApplicationRepository} from "../../../../repositories/application.repository";
@CommandHandler(WithdrawApplicationCommand)
export class WithdrawApplicationHandler
    implements ICommandHandler<WithdrawApplicationCommand> {

    constructor(
        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(command: WithdrawApplicationCommand) {

        const { applicationId, userId } = command

        const application = await this.appRepo.findById(applicationId)
        if (!application) {
            throw new NotFoundException('Application not found')
        }

        const student = await this.studentRepo.findByUserId(userId)
        if (!student) {
            throw new ForbiddenException('Student not found')
        }

        if (application.studentId !== student.id) {
            throw new ForbiddenException('Not allowed')
        }

        // 🔥 bloquer si déjà finalisé
        if (
            application.status === ApplicationStatus.ACCEPTED ||
            application.status === ApplicationStatus.REJECTED
        ) {
            throw new BadRequestException('Cannot withdraw finalized application')
        }

        application.status = ApplicationStatus.WITHDRAWN

        return this.appRepo.save(application)
    }
}