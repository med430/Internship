import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { CreateOfferCommand } from '../create-offer.command'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { ISkillRepository } from '../../../../repositories/skill.repository'

import { Offer } from '../../../../../Domain/entities/offer.entity'
import { SkillAssignment } from '../../../../../Domain/entities/skill-assignment.entity'
import { SkillLevel } from '../../../../../Domain/enums/skill-level.enum'

@CommandHandler(CreateOfferCommand)
export class CreateOfferHandler implements ICommandHandler<CreateOfferCommand> {

    constructor(
        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(ISkillRepository)
        private readonly skillRepo: ISkillRepository
    ) {}

    async execute(command: CreateOfferCommand) {

        const { dto, creatorId } = command

        // 🔥 validation date
        if (new Date(dto.startDate) >= new Date(dto.endDate)) {
            throw new Error('Invalid date range')
        }

        const skills = await this.skillRepo.findByIds(
            dto.requiredSkills.map(s => s.skillId)
        )

        const skillAssignments = dto.requiredSkills.map(req => {
            const skill = skills.find(s => s.id === req.skillId)
            if (!skill) throw new Error(`Skill ${req.skillId} not found`)

            return new SkillAssignment(
                skill,
                req.level as SkillLevel // 🔥 FIX
            )
        })

        const offer = new Offer(
            randomUUID(),
            creatorId,

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