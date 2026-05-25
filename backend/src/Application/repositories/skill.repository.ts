import { Skill } from '../../Domain/entities/skill.entity'
import { IGenericRepository } from './generic.repository'
export abstract class ISkillRepository extends IGenericRepository<Skill, number> {
    abstract findByName(name: string): Promise<Skill | null>
    abstract findByNames(names: string[]): Promise<Skill[]>
    abstract findByIds(ids: number[]): Promise<Skill[]>
}
