import { Skill as SkillDB } from '@prisma/client'
import { Skill } from '../../../../Domain/entities/skill.entity'
import { IGenericMapper } from './generic.mapper'

export class SkillPrismaMapper implements IGenericMapper<Skill, SkillDB> {

    // 🔥 DB → Domain
    toDomain(entity: SkillDB): Skill {
        return new Skill(
            entity.id,
            entity.name // mapping name → designation
        )
    }

    // 🔥 Domain → DB
    toPersistence(entity: Skill): SkillDB {
        return {
            id: entity.id,
            name: entity.name // mapping designation → name
        }
    }
}