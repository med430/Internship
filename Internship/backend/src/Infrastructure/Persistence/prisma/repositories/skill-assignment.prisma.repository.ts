import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { SkillAssignment } from '../../../../Domain/entities/skill-assignment.entity'
import { SkillAssignmentPrismaMapper } from '../mappers/skill-assignment.mapper'
import { SkillLevel } from '../../../../Domain/enums/skill-level.enum'

@Injectable()
export class SkillAssignmentRepository implements SkillAssignmentRepository {

  constructor(
      private readonly prisma: PrismaService,
      private readonly mapper: SkillAssignmentPrismaMapper
  ) {}

  async findByStudentAndSkill(
      studentProfileId: string,
      skillId: number
  ): Promise<SkillAssignment | null> {

    const res = await this.prisma.skillAssignment.findFirst({
      where: {
        studentProfileId,
        skillId
      }
    })

    return res ? this.mapper.toDomain(res) : null
  }

  async findById(id: string): Promise<SkillAssignment | null> {
    const res = await this.prisma.skillAssignment.findUnique({
      where: { id }
    })

    return res ? this.mapper.toDomain(res) : null
  }

  async create(data: {
    id: string
    studentProfileId: string
    skillId: number
    level: SkillLevel
  }): Promise<SkillAssignment> {

    const result = await this.prisma.skillAssignment.create({
      data: {
        id: data.id,
        studentProfileId: data.studentProfileId,
        skillId: data.skillId,
        level: data.level
      }
    })

    return this.mapper.toDomain(result)
  }

  async updateLevel(
      id: string,
      level: SkillLevel
  ): Promise<SkillAssignment> {

    const result = await this.prisma.skillAssignment.update({
      where: { id },
      data: { level }
    })

    return this.mapper.toDomain(result)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.skillAssignment.delete({
      where: { id }
    })
  }
}