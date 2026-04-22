import { Offer } from '../../../../Domain/entities/offer.entity'
import { SkillAssignment } from '../../../../Domain/entities/skill-assignment.entity'
import { SkillPrismaMapper } from './skill.mapper'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OfferPrismaMapper {

    private skillMapper = new SkillPrismaMapper()

    toDomain(entity: any): Offer {

        const requiredSkills = entity.requiredSkills
            ? entity.requiredSkills.map(rs =>
                new SkillAssignment(
                    this.skillMapper.toDomain(rs.skill),
                    rs.level
                )
            )
            : []

        return new Offer(
            entity.id,
            entity.recruiterProfileId, // 🔥 FIX

            entity.title,
            entity.description,

            entity.company,
            entity.location,
            entity.domain,

            entity.startDate,
            entity.endDate,

            requiredSkills,
            entity.type,

            entity.createdAt,
            entity.updatedAt,
            entity.deletedAt ?? undefined
        )
    }
    toPersistence(entity: Offer) {
        return {
            id: entity.id,

            recruiterProfileId: entity.recruiterProfileId, // 🔥 FIX

            title: entity.title,
            description: entity.description,
            company: entity.company,
            location: entity.location,
            domain: entity.domain,
            startDate: entity.startDate,
            endDate: entity.endDate,
            type: entity.type,

            createdAt: entity.createdAt,
            updatedAt: new Date(),
            deletedAt: entity.deletedAt ?? null
        }
    }
}