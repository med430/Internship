import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { Skill } from '../../../../Domain/entities/skill.entity'
import { Skill as SkillDB } from '@prisma/client'
import { SkillPrismaMapper } from '../mappers/skill.mapper'
import { ISkillRepository } from '../../../../Application/repositories/skill.repository'

@Injectable()
export class SkillRepository implements ISkillRepository {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: SkillPrismaMapper
    ) {}

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