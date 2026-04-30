import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException
} from '@nestjs/common'

import { UpdateApplicationStatusCommand } from '../update-application-status.command'


import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'

import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'
import {IApplicationRepository} from "../../../../repositories/application.repository";
@CommandHandler(UpdateApplicationStatusCommand)
export class UpdateApplicationStatusHandler
    implements ICommandHandler<UpdateApplicationStatusCommand> {

    constructor(
        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository
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

        return this.appRepo.save(application)
    }
}