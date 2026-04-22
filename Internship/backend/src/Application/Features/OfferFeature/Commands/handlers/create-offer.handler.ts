// application/handlers/offer/create-offer.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { randomUUID } from 'crypto'
import {CreateOfferCommand} from "../create-offer.command";
import {IOfferRepository} from "../../../../repositories/offer.repository";
import {ISkillRepository} from "../../../../repositories/skill.repository";
import {Offer} from "../../../../../Domain/entities/offer.entity";
import {SkillAssignment} from "../../../../../Domain/entities/skill-assignment.entity";

@CommandHandler(CreateOfferCommand)
export class CreateOfferHandler implements ICommandHandler<CreateOfferCommand> {

    constructor(
        private offerRepo: IOfferRepository,
        private skillRepo: ISkillRepository
    ) {}

    async execute(command: CreateOfferCommand) {

        const { dto, creatorId } = command

        const skills = await this.skillRepo.findByIds(
            dto.requiredSkills.map(s => s.skillId)
        )

        const skillAssignments = dto.requiredSkills.map(req => {
            const skill = skills.find(s => s.id === req.skillId)
            if (!skill) throw new Error('Skill not found')

            return new SkillAssignment(skill, req.level as any)
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