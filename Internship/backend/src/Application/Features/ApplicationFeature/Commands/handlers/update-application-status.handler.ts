import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException
} from '@nestjs/common'

import { UpdateApplicationStatusCommand } from '../update-application-status.command'

import { IApplicationRepository } from '../../../../repositories/application.repository.'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'

import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'

@CommandHandler(UpdateApplicationStatusCommand)
export class UpdateApplicationStatusHandler
    implements ICommandHandler<UpdateApplicationStatusCommand>
{
    constructor(
        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository
    ) {}

    async execute(command: UpdateApplicationStatusCommand) {

        const { applicationId, recruiterId, status } = command

        // 🔥 1. Vérifier application
        const application = await this.appRepo.findById(applicationId)
        if (!application) {
            throw new NotFoundException('Application not found')
        }

        // 🔥 2. Vérifier offre associée
        const offer = await this.offerRepo.findById(application.offerId)
        if (!offer || offer.deletedAt) {
            throw new NotFoundException('Offer not found')
        }

        // 🔥 3. Convertir USER → RecruiterProfile
        const recruiterProfile = await this.recruiterRepo.findByUserId(recruiterId)

        if (!recruiterProfile) {
            throw new NotFoundException('Recruiter profile not found')
        }

        // 🔥 4. Vérifier ownership CORRECT
        if (offer.recruiterProfileId !== recruiterProfile.id) {
            throw new ForbiddenException('Not allowed')
        }

        // 🔥 5. Empêcher double traitement
        if (application.status !== ApplicationStatus.PENDING) {
            throw new BadRequestException('Application already processed')
        }

        // 🔥 6. Update status
        application.status = status as ApplicationStatus

        // 🔥 7. Si ACCEPT → exclusivité
        if (status === 'ACCEPTED') {
            await this.appRepo.rejectAllExcept(
                application.offerId,
                application.id
            )
        }

        // 🔥 8. Save
        return await this.appRepo.update(application)
    }
}