import { Skill } from '../../Domain/entities/skill.entity';
import { IGenericRepository } from './generic.repository';
export declare abstract class ISkillRepository extends IGenericRepository<Skill, number> {
    abstract findByName(name: string): Promise<Skill | null>;
    abstract findByIds(ids: number[]): Promise<Skill[]>;
}
