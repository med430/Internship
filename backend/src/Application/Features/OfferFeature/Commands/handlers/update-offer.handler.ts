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

    async execute(cmd: UpdateOfferCommand) {

        const offer = await this.offerRepo.findById(cmd.offerId)
        if (!offer || offer.deletedAt) throw new NotFoundException()

        const recruiter = await this.recruiterRepo.findByUserId(cmd.userId)
        if (!recruiter) throw new ForbiddenException()

        if (offer.recruiterProfileId !== recruiter.id) {
            throw new ForbiddenException()
        }

        // update fields
        offer.title = cmd.title ?? offer.title
        offer.description = cmd.description ?? offer.description
        offer.company = cmd.company ?? offer.company
        offer.location = cmd.location ?? offer.location
        offer.domain = cmd.domain ?? offer.domain
        offer.isPaid = cmd.isPaid ?? offer.isPaid
        offer.workMode = cmd.workMode ?? offer.workMode

        if (cmd.startDate) offer.startDate = cmd.startDate
        if (cmd.endDate) offer.endDate = cmd.endDate
        if (cmd.type) offer.type = cmd.type

        if (offer.startDate >= offer.endDate) {
            throw new BadRequestException('Invalid date range')
        }

        // skills
        if (cmd.requiredSkills) {

            const skills = await this.skillRepo.findByIds(
                cmd.requiredSkills.map(s => s.skillId)
            )

            if (skills.length !== cmd.requiredSkills.length) {
                throw new BadRequestException('Invalid skills')
            }

            offer.skillRequirements = cmd.requiredSkills.map(req => {
                const skill = skills.find(s => s.id === req.skillId)!
                return new SkillRequirement(randomUUID(), skill, req.level)
            })
        }

        offer.updatedAt = new Date()

        return this.offerRepo.save(offer)
    }
}