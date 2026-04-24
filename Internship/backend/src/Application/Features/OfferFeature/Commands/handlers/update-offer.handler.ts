import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Inject
} from '@nestjs/common'

import { UpdateOfferCommand } from '../update-offer.command'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { ISkillRepository } from '../../../../repositories/skill.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'

import { SkillAssignment } from '../../../../../Domain/entities/skill-assignment.entity'
import { SkillLevel } from '../../../../../Domain/enums/skill-level.enum'
import { randomUUID } from 'crypto';
import { SkillRequirement } from '../../../../../Domain/entities/skill-requirement';

@CommandHandler(UpdateOfferCommand)
export class UpdateOfferHandler implements ICommandHandler<UpdateOfferCommand> {

    constructor(
        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(ISkillRepository)
        private readonly skillRepo: ISkillRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository
    ) {}

    async execute(command: UpdateOfferCommand) {

        const { offerId, dto, userId } = command

        const offer = await this.offerRepo.findById(offerId)
        if (!offer) throw new NotFoundException('Offer not found')

        // 🔐 récupérer recruiter profile
        const recruiterProfile = await this.recruiterRepo.findByUserId(userId)

        if (!recruiterProfile) {
            throw new ForbiddenException('No recruiter profile')
        }

        if (offer.recruiterProfileId !== recruiterProfile.id) {
            throw new ForbiddenException('Not allowed')
        }

        // 🔹 update champs simples
        offer.title = dto.title ?? offer.title
        offer.description = dto.description ?? offer.description
        offer.company = dto.company ?? offer.company
        offer.location = dto.location ?? offer.location
        offer.domain = dto.domain ?? offer.domain

        if (dto.startDate) offer.startDate = new Date(dto.startDate)
        if (dto.endDate) offer.endDate = new Date(dto.endDate)

        if (dto.type) offer.type = dto.type

        // 🔥 validation dates
        if (offer.startDate >= offer.endDate) {
            throw new BadRequestException('Invalid date range')
        }

        // 🔹 update skills
        if (dto.requiredSkills) {

            const skills = await this.skillRepo.findByIds(
                dto.requiredSkills.map(s => s.skillId)
            )

            if (skills.length !== dto.requiredSkills.length) {
                throw new BadRequestException('Invalid skill IDs')
            }

            offer.skillRequirements = dto.requiredSkills.map(req => {
                const skill = skills.find(s => s.id === req.skillId)!

                return new SkillRequirement(
                    randomUUID(),
                    skill,
                    req.level as SkillLevel
                )
            })
        }

        return this.offerRepo.update(offer)
    }
}