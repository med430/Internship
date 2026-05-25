import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException
} from '@nestjs/common'

import { UpdateApplicationStatusCommand } from '../update-application-status.command'

import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { IApplicationRepository } from '../../../../repositories/application.repository'
import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'
import { ApplicationStatusChangedEvent } from '../../../../../Domain/events/application-status-changed.event'
@CommandHandler(UpdateApplicationStatusCommand)
export class UpdateApplicationStatusHandler
    implements ICommandHandler<UpdateApplicationStatusCommand> {

    constructor(
        private readonly eventBus: EventBus,

        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
    ) {}

    async execute(command: UpdateApplicationStatusCommand) {

        const { applicationId, userId, status } = command

        const application = await this.appRepo.findById(applicationId)
        if (!application) throw new NotFoundException('Application not found')

        const offer = await this.offerRepo.findById(application.offerId)
        if (!offer || offer.deletedAt) {
            throw new NotFoundException('Offer not found')
        }

        const recruiter = await this.recruiterRepo.findByUserId(userId)
        if (!recruiter) {
            throw new NotFoundException('Recruiter profile not found')
        }

        if (offer.recruiterProfileId !== recruiter.id) {
            throw new ForbiddenException('Not allowed')
        }

        // 🔥 états finaux bloqués
        if (
            application.status === ApplicationStatus.ACCEPTED ||
            application.status === ApplicationStatus.REJECTED
        ) {
            throw new BadRequestException('Application already finalized')
        }

        // 🔥 transitions autorisées STRICTES
        if (
            status !== ApplicationStatus.ACCEPTED &&
            status !== ApplicationStatus.REJECTED
        ) {
            throw new BadRequestException('Invalid status transition')
        }

        application.status = status

        // 🔥 exclusivité si accepté
        if (status === ApplicationStatus.ACCEPTED) {
            await this.appRepo.rejectAllExcept(
                application.offerId,
                application.id
            )
        }

        const saved = await this.appRepo.save(application)

        const student = await this.studentRepo.findById(application.studentId)
        if (student) {
            this.eventBus.publish(
                new ApplicationStatusChangedEvent(
                    student.userId,
                    application.id,
                    offer.title,
                    status,
                )
            )
        }

        return saved
    }
}