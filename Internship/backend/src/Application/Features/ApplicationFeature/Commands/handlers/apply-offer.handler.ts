import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    BadRequestException,
    NotFoundException
} from '@nestjs/common'
import { randomUUID } from 'crypto'

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

        // 🔥 1. Vérifier que l’offre existe
        const offer = await this.offerRepo.findById(offerId)

        if (!offer || offer.deletedAt) {
            throw new NotFoundException('Offer not found')
        }

        // 🔥 2. Récupérer le StudentProfile depuis le User
        const studentProfile = await this.studentRepo.findByUserId(userId)

        if (!studentProfile) {
            throw new NotFoundException('Student profile not found')
        }

        // 🔥 3. Empêcher double candidature
        const existing = await this.appRepo.findByStudentAndOffer(
            studentProfile.id, // ✔ IMPORTANT
            offerId
        )

        if (existing) {
            throw new BadRequestException('Already applied')
        }

        // 🔥 4. Créer l'application
        const application = new Application(
            randomUUID(),
            studentProfile.id, // ✔ FK correcte
            offerId,
            ApplicationStatus.PENDING,
            cvUrl,
            0 // matchScore initial
        )

        // 🔥 5. Sauvegarder
        return await this.appRepo.save(application)
    }
}