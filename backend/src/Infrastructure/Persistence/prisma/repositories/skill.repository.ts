import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { Skill } from '../../../../Domain/entities/skill.entity'
import { Skill as SkillDB } from '@prisma/client'
import { SkillMapper } from '../mappers/skill.mapper'
import { ISkillRepository } from '../../../../Application/repositories/skill.repository'
import { GenericRepository } from './generic.repositories';

@Injectable()
export class SkillRepositoryImpl extends GenericRepository<Skill, any, number> implements ISkillRepository {

    constructor(
        protected readonly prisma: PrismaService,
        protected readonly mapper: SkillMapper
    ) {
      super(prisma, 'skill', mapper);
    }

    async findByIds(ids: number[]): Promise<Skill[]> {
        const results = await this.prisma.skill.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        })

        return results.map(r => this.mapper.toDomain(r))
    }

    async findByName(name: string): Promise<Skill | null> {
        const result = await this.prisma.skill.findUnique({
            where: { name }
        })

        return result ? this.mapper.toDomain(result) : null
    }

    async findByNames(names: string[]): Promise<Skill[]> {
        const results = await this.prisma.skill.findMany({
            where: { name: { in: names } }
        })

        return results.map(r => this.mapper.toDomain(r))
    }

    // 🔥 minimal pour respecter l’interface
    async findById(id: number): Promise<Skill | null> {
        const result = await this.prisma.skill.findUnique({
            where: { id }
        })

        return result ? this.mapper.toDomain(result) : null
    }

    async findAll(): Promise<Skill[]> {
        const results = await this.prisma.skill.findMany()
        return results.map(r => this.mapper.toDomain(r))
    }

    async findPaginated(pageNumber: number, pageSize: number): Promise<Skill[]> {
      const skip = (pageNumber - 1) * pageSize;

      const results = await (this.prisma['skill'] as any).findMany({
        skip,
        take: pageSize,
      });

      return results.map(r => this.mapper.toDomain(r));
    }

    async save(entity: Skill): Promise<Skill> {
        const result = await this.prisma.skill.create({
            data: {
                name: entity.name
            }
        })

        return this.mapper.toDomain(result)
    }

    async delete(id: number): Promise<void> {
        await this.prisma.skill.delete({
            where: { id }
        })
    }
}