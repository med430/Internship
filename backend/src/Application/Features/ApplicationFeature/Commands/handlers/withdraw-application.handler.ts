import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException
} from '@nestjs/common'

import { WithdrawApplicationCommand } from '../withdraw-application.command'

import { IApplicationRepository } from '../../../../repositories/application.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'

import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'
import { ApplicationWithdrawnEvent } from '../../../../../Domain/events/application-withdrawn.event'
@CommandHandler(WithdrawApplicationCommand)
export class WithdrawApplicationHandler
    implements ICommandHandler<WithdrawApplicationCommand> {

    constructor(
        private readonly eventBus: EventBus,

        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository,
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

        const saved = await this.appRepo.save(application)

        const offer = await this.offerRepo.findById(application.offerId)
        if (offer) {
            const recruiter = await this.recruiterRepo.findById(offer.recruiterProfileId)
            if (recruiter) {
                this.eventBus.publish(
                    new ApplicationWithdrawnEvent(
                        recruiter.userId,
                        application.id,
                        offer.title,
                    )
                )
            }
        }

        return saved
    }
}