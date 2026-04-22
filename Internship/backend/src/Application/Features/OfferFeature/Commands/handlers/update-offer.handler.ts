// application/handlers/offer/update-offer.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import {UpdateOfferCommand} from "../update-offer.command";
import {IOfferRepository} from "../../../../repositories/offer.repository";
import {ISkillRepository} from "../../../../repositories/skill.repository";
import {SkillAssignment} from "../../../../../Domain/entities/skill-assignment.entity";

@CommandHandler(UpdateOfferCommand)
export class UpdateOfferHandler implements ICommandHandler<UpdateOfferCommand> {

    constructor(
        private offerRepo: IOfferRepository,
        private skillRepo: ISkillRepository
    ) {}

    async execute(command: UpdateOfferCommand) {

        const { offerId, dto, userId } = command

        const offer = await this.offerRepo.findById(offerId)
        if (!offer) throw new NotFoundException('Offer not found')

        // 🔐 sécurité
        if (offer.creatorId !== userId) {
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

        // 🔹 update skills (si envoyés)
        if (dto.requiredSkills) {
            const skills = await this.skillRepo.findByIds(
                dto.requiredSkills.map(s => s.skillId)
            )

            offer.requiredSkills = dto.requiredSkills.map(req => {
                const skill = skills.find(s => s.id === req.skillId)
                if (!skill) throw new NotFoundException('Skill not found')

                return new SkillAssignment(skill, req.level as any)
            })
        }

        return this.offerRepo.save(offer)
    }
}