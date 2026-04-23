import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    BadRequestException,
    NotFoundException
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { unlinkSync, existsSync } from 'fs'
import { join } from 'path'

import { ApplyToOfferCommand } from "../apply-offer.command"

import { IOfferRepository } from "../../../../repositories/offer.repository"
import { IApplicationRepository } from "../../../../repositories/application.repository."
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository"

import { Application } from "../../../../../Domain/entities/application.entity"
import { ApplicationStatus } from "../../../../../Domain/enums/application-status.enum"

@CommandHandler(ApplyToOfferCommand)
export class ApplyToOfferHandler implements ICommandHandler<ApplyToOfferCommand> {

    constructor(
        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(command: ApplyToOfferCommand) {

        const { studentId: userId, offerId, cvUrl } = command

        // 🔥 1. Vérifier offre
        const offer = await this.offerRepo.findById(offerId)

        if (!offer || offer.deletedAt) {
            throw new NotFoundException('Offer not found')
        }

        // 🔥 2. Récupérer StudentProfile
        const studentProfile = await this.studentRepo.findByUserId(userId)

        if (!studentProfile) {
            throw new NotFoundException('Student profile not found')
        }

        // 🔥 3. Vérifier CV
        if (!cvUrl) {
            throw new BadRequestException('CV is required')
        }

        // 🔥 4. Vérifier ancienne candidature (RE-APPLY LOGIC)
        const previous = await this.appRepo.findByStudentAndOffer(
            studentProfile.id,
            offerId
        )

        if (previous) {

            // 🔒 protection path
            if (!previous.cvUrl.startsWith('/uploads/cvs')) {
                throw new BadRequestException('Invalid file path')
            }

            // 🔥 supprimer ancien fichier
            const oldPath = join(process.cwd(), previous.cvUrl)

            if (existsSync(oldPath)) {
                try {
                    unlinkSync(oldPath)
                } catch (e) {
                    console.warn('Failed to delete old CV:', e)
                }
            }

            // 🔥 supprimer ancienne candidature
            await this.appRepo.delete(previous.id)
        }

        // 🔥 5. Create nouvelle candidature
        const application = new Application(
            randomUUID(),
            studentProfile.id,
            offerId,
            ApplicationStatus.PENDING,
            cvUrl,
            0
        )

        return await this.appRepo.save(application)
    }
}