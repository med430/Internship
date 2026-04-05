import { Skill } from '../../Domain/entities/skill.entity'
import { IGenericRepository } from './generic.repository.interface'

export interface ISkillRepository extends IGenericRepository<Skill> {
    findByName(name: string): Promise<Skill | null>
}