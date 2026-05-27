import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs'
import { Inject, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { RespondToInterviewSlotCommand } from '../respond-to-interview-slot.command'
import { IInterviewSlotRepository } from '../../../../repositories/interview-slot.repository'
import { IApplicationRepository } from '../../../../repositories/application.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'

import { InterviewSlot } from '../../../../../Domain/entities/interview-slot.entity'
import { InterviewSlotStatus } from '../../../../../Domain/enums/interview-slot-status.enum'
import { InterviewSlotRespondedEvent } from '../../../../../Domain/events/interview-slot-responded.event'
import { InterviewSlotProposedEvent } from '../../../../../Domain/events/interview-slot-proposed.event'

@CommandHandler(RespondToInterviewSlotCommand)
export class RespondToInterviewSlotHandler implements ICommandHandler<RespondToInterviewSlotCommand> {
    constructor(
        private readonly eventBus: EventBus,

        @Inject(IInterviewSlotRepository)
        private readonly slotRepo: IInterviewSlotRepository,

        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository,
    ) {}

    async execute(command: RespondToInterviewSlotCommand): Promise<InterviewSlot> {
        const { studentUserId, slotId, action, counterStartAt, counterEndAt, counterNotes } = command

        const slot = await this.slotRepo.findById(slotId)
        if (!slot) throw new NotFoundException('Interview slot not found')
        if (slot.status !== InterviewSlotStatus.PROPOSED) {
            throw new BadRequestException('Slot is no longer pending')
        }

        const application = await this.appRepo.findById(slot.applicationId)
        if (!application) throw new NotFoundException('Application not found')

        const studentProfile = await this.studentRepo.findByUserId(studentUserId)
        if (!studentProfile || studentProfile.id !== application.studentId) {
            throw new ForbiddenException('You are not the applicant for this slot')
        }

        const offer = await this.offerRepo.findById(application.offerId)
        const offerTitle = offer?.title ?? 'Interview'

        const recruiterProfile = offer
            ? await this.recruiterRepo.findById(offer.recruiterProfileId)
            : null

        if (action === 'counter') {
            if (!counterStartAt || !counterEndAt) {
                throw new BadRequestException('Counter-proposal requires start and end dates')
            }
            if (counterStartAt >= counterEndAt) throw new BadRequestException('startAt must be before endAt')
            if (counterStartAt < new Date()) throw new BadRequestException('Counter-proposal date must be in the future')

            slot.status = InterviewSlotStatus.DECLINED
            await this.slotRepo.update(slot)

            const counterSlot = new InterviewSlot(
                randomUUID(),
                slot.applicationId,
                studentUserId,
                counterStartAt,
                counterEndAt,
                InterviewSlotStatus.PROPOSED,
                counterNotes ?? null,
                slotId,
            )
            const saved = await this.slotRepo.save(counterSlot)

            if (recruiterProfile) {
                this.eventBus.publish(new InterviewSlotProposedEvent(
                    recruiterProfile.userId,
                    saved.id,
                    slot.applicationId,
                    studentUserId,
                    counterStartAt,
                    counterEndAt,
                    offerTitle,
                ))
            }
            return saved
        }

        slot.status = action === 'accept' ? InterviewSlotStatus.CONFIRMED : InterviewSlotStatus.DECLINED
        const updated = await this.slotRepo.update(slot)

        if (recruiterProfile) {
            this.eventBus.publish(new InterviewSlotRespondedEvent(
                recruiterProfile.userId,
                slotId,
                slot.status,
                offerTitle,
            ))
        }

        return updated
    }
}