import { Skill as SkillDB } from '@prisma/client';
import { Skill } from '../../../../Domain/entities/skill.entity';
import { IGenericMapper } from './generic.mapper';
export declare class SkillMapper implements IGenericMapper<Skill, SkillDB> {
    toDomain(entity: SkillDB): Skill;
    toPersistence(entity: Skill): SkillDB;
}
