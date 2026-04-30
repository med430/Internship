import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { IOfferRepository } from '../../../../repositories/offer.repository'
import { ISkillRepository } from '../../../../repositories/skill.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'

import { Offer } from '../../../../../Domain/entities/offer.entity'
import { CreateOfferCommand } from "../create-offer.command"
import { SkillRequirement } from '../../../../../Domain/entities/skill-requirement';
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

    async execute(cmd: CreateOfferCommand) {

        const recruiter = await this.recruiterRepo.findByUserId(cmd.userId)
        if (!recruiter) throw new NotFoundException()

        if (cmd.startDate >= cmd.endDate) {
            throw new BadRequestException('Invalid date range')
        }

        const skills = await this.skillRepo.findByIds(
            cmd.requiredSkills.map(s => s.skillId)
        )

        if (skills.length !== cmd.requiredSkills.length) {
            throw new BadRequestException('Invalid skills')
        }

        const skillRequirements = cmd.requiredSkills.map(req => {
            const skill = skills.find(s => s.id === req.skillId)!
            return new SkillRequirement(randomUUID(), skill, req.level)
        })

        const offer = new Offer(
            randomUUID(),
            recruiter.id,
            cmd.title,
            cmd.description,
            cmd.company,
            cmd.location,
            cmd.domain,
            cmd.isPaid,
            cmd.workMode,
            cmd.startDate,
            cmd.endDate,
            skillRequirements,
            cmd.type
        )

        return this.offerRepo.save(offer)
    }
}