import { Skill } from '../../Domain/entities/skill.entity'
import { IGenericRepository } from './generic.repository'

export abstract class ISkillRepository extends IGenericRepository<Skill> {
    abstract findByName(name: string): Promise<Skill | null>
    abstract findByIds(ids: number[]): Promise<Skill[]>
}
