import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException
} from '@nestjs/common'

import { join } from 'path'
import { existsSync } from 'fs'

import { DownloadCvCommand } from '../download-cv.command'

import { IApplicationRepository } from '../../../../repositories/application.repository.'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'

@CommandHandler(DownloadCvCommand)
export class DownloadCvHandler implements ICommandHandler<DownloadCvCommand> {

    constructor(
        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository
    ) {}

    async execute(command: DownloadCvCommand): Promise<string> {

        const { applicationId, userId } = command

        // 🔥 1. Application
        const application = await this.appRepo.findById(applicationId)
        if (!application) throw new NotFoundException('Application not found')

        // 🔥 2. Offer
        const offer = await this.offerRepo.findById(application.offerId)
        if (!offer) throw new NotFoundException('Offer not found')

        // 🔥 3. RecruiterProfile
        const recruiter = await this.recruiterRepo.findByUserId(userId)
        if (!recruiter) throw new ForbiddenException()

        // 🔥 4. Ownership check
        if (offer.recruiterProfileId !== recruiter.id) {
            throw new ForbiddenException('Not allowed')
        }

        // 🔥 5. File path
        const filePath = join(process.cwd(), application.cvUrl)

        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found')
        }

        return filePath
    }
}