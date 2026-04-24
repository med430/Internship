import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { IOfferRepository } from '../../../../repositories/offer.repository'
import { ISkillRepository } from '../../../../repositories/skill.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'

import { Offer } from '../../../../../Domain/entities/offer.entity'
import { SkillAssignment } from '../../../../../Domain/entities/skill-assignment.entity'
import { CreateOfferCommand } from "../create-offer.command"

@CommandHandler(CreateOfferCommand)
export class CreateOfferHandler implements ICommandHandler<CreateOfferCommand> {

    constructor(
        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(ISkillRepository)
        private readonly skillRepo: ISkillRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository
    ) {}

    async execute(command: CreateOfferCommand) {

        const { dto, creatorId } = command

        // 🔥 récupérer recruiterProfile
        const recruiterProfile = await this.recruiterRepo.findByUserId(creatorId)

        if (!recruiterProfile) {
            throw new NotFoundException('Recruiter profile not found')
        }

        // 🔥 validation dates
        if (new Date(dto.startDate) >= new Date(dto.endDate)) {
            throw new BadRequestException('Invalid date range')
        }

        // 🔥 récupérer skills
        const skills = await this.skillRepo.findByIds(
            dto.requiredSkills.map(s => s.skillId)
        )

        if (skills.length !== dto.requiredSkills.length) {
            throw new BadRequestException('Invalid skill IDs')
        }

        // 🔥 construire SkillAssignment
        const skillAssignments = dto.requiredSkills.map(req => {
            const skill = skills.find(s => s.id === req.skillId)!

            return new SkillAssignment(
                skill,
                req.level
            )
        })

        // 🔥 créer Offer avec recruiterProfileId
        const offer = new Offer(
            randomUUID(),
            recruiterProfile.id, // 🔥 FIX CRITIQUE
            dto.title,
            dto.description,
            dto.company,
            dto.location,
            dto.domain,
            new Date(dto.startDate),
            new Date(dto.endDate),
            skillAssignments,
            dto.type
        )

        return this.offerRepo.save(offer)
    }
}