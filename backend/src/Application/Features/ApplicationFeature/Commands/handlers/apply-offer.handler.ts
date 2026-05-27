import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs'
import {
    Inject,
    BadRequestException,
    NotFoundException
} from '@nestjs/common'
import { randomUUID } from 'crypto'

import { ApplyToOfferCommand } from '../apply-offer.command'

import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IApplicationRepository } from '../../../../repositories/application.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import { ICoverLetterRepository } from '../../../../repositories/coverletter.repository'
import { ICVRepository } from '../../../../repositories/cv.repository'

import { Application } from '../../../../../Domain/entities/application.entity'
import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'
import { ApplicationSubmittedEvent } from '../../../../../Domain/events/application-submitted.event'
@CommandHandler(ApplyToOfferCommand)
export class ApplyToOfferHandler
    implements ICommandHandler<ApplyToOfferCommand> {

    constructor(
        private readonly eventBus: EventBus,

        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository,

        @Inject(ICVRepository)
        private readonly cvRepo: ICVRepository,

        @Inject(ICoverLetterRepository)
        private readonly letterRepo: ICoverLetterRepository,
    ) {}

    async execute(command: ApplyToOfferCommand) {

        const { userId, offerId, cvId, coverLetterId } = command

        // 🔥 1. OFFER
        const offer = await this.offerRepo.findById(offerId)
        if (!offer || offer.deletedAt) {
            throw new NotFoundException('Offer not found')
        }

        // 🔥 2. PROFILE
        const profile = await this.studentRepo.findByUserId(userId)
        if (!profile) {
            throw new NotFoundException('Student profile not found')
        }

        // 🔥 3. VALIDATION CV
        if (!cvId) {
            throw new BadRequestException('CV is required')
        }

        const cv = await this.cvRepo.findById(cvId)
        if (!cv || cv.deletedAt || cv.studentId !== profile.id) {
            throw new BadRequestException('Invalid CV')
        }

        // 🔥 4. VALIDATION LETTER
        if (coverLetterId) {
            const letter = await this.letterRepo.findById(coverLetterId)

            if (!letter || letter.deletedAt || letter.studentId !== profile.id) {
                throw new BadRequestException('Invalid cover letter')
            }
        }

        // 🔥 5. EXISTING APPLICATION
        const existing = await this.appRepo.findByStudentAndOffer(
            profile.id,
            offerId
        )

        if (existing) {
            if (existing.status !== ApplicationStatus.WITHDRAWN) {
                throw new BadRequestException('Already applied')
            }

            existing.cvId = cvId
            existing.coverLetterId = coverLetterId
            existing.status = ApplicationStatus.SUBMITTED
            existing.matchScore = 0

            const saved = await this.appRepo.save(existing)

            const recruiter = await this.recruiterRepo.findById(offer.recruiterProfileId)
            if (recruiter) {
                this.eventBus.publish(
                    new ApplicationSubmittedEvent(
                        recruiter.userId,
                        saved.id,
                        offer.title,
                    )
                )
            }

            return saved
        }

        // 🔥 6. CREATE APPLICATION (ordre CORRECT)
        const application = new Application(
            randomUUID(),
            profile.id,
            offerId,
            cvId,
            ApplicationStatus.SUBMITTED,
            0,
            coverLetterId
        )

        const saved = await this.appRepo.save(application)

        const recruiter = await this.recruiterRepo.findById(offer.recruiterProfileId)
        if (recruiter) {
            this.eventBus.publish(
                new ApplicationSubmittedEvent(
                    recruiter.userId,
                    saved.id,
                    offer.title,
                )
            )
        }

        return saved
    }
}