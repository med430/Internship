import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs'
import { Inject, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { ProposeInterviewSlotCommand } from '../propose-interview-slot.command'
import { IInterviewSlotRepository } from '../../../../repositories/interview-slot.repository'
import { IApplicationRepository } from '../../../../repositories/application.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { IOfferRepository } from '../../../../repositories/offer.repository'

import { InterviewSlot } from '../../../../../Domain/entities/interview-slot.entity'
import { InterviewSlotStatus } from '../../../../../Domain/enums/interview-slot-status.enum'
import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'
import { InterviewSlotProposedEvent } from '../../../../../Domain/events/interview-slot-proposed.event'

@CommandHandler(ProposeInterviewSlotCommand)
export class ProposeInterviewSlotHandler implements ICommandHandler<ProposeInterviewSlotCommand> {
    constructor(
        private readonly eventBus: EventBus,

        @Inject(IInterviewSlotRepository)
        private readonly slotRepo: IInterviewSlotRepository,

        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,
    ) {}

    async execute(command: ProposeInterviewSlotCommand): Promise<InterviewSlot> {
        const { recruiterUserId, applicationId, startAt, endAt, notes, parentSlotId } = command

        const application = await this.appRepo.findById(applicationId)
        if (!application || application.deletedAt) throw new NotFoundException('Application not found')
        if (application.status !== ApplicationStatus.ACCEPTED) {
            throw new BadRequestException('Can only schedule interviews for accepted applications')
        }

        const recruiter = await this.recruiterRepo.findByUserId(recruiterUserId)
        if (!recruiter) throw new NotFoundException('Recruiter profile not found')

        const offer = await this.offerRepo.findById(application.offerId)
        if (!offer || offer.recruiterProfileId !== recruiter.id) {
            throw new ForbiddenException('You can only schedule interviews for your own offers')
        }

        if (startAt >= endAt) throw new BadRequestException('startAt must be before endAt')
        if (startAt < new Date()) throw new BadRequestException('Interview date must be in the future')

        const slot = new InterviewSlot(
            randomUUID(),
            applicationId,
            recruiterUserId,
            startAt,
            endAt,
            InterviewSlotStatus.PROPOSED,
            notes ?? null,
            parentSlotId ?? null,
        )

        const saved = await this.slotRepo.save(slot)

        const studentProfile = await this.studentRepo.findById(application.studentId)
        if (studentProfile) {
            this.eventBus.publish(new InterviewSlotProposedEvent(
                studentProfile.userId,
                saved.id,
                applicationId,
                recruiterUserId,
                startAt,
                endAt,
                offer.title,
            ))
        }

        return saved
    }
}