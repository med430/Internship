// infrastructure/repositories/skill-assignment.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { SkillAssignmentMapper } from '../mappers/skill-assignment.mapper'
import {ISkillAssignmentRepository} from "../../../../Application/repositories/skill-assignment.repository";
import {SkillAssignment} from "../../../../Domain/entities/skill-assignment.entity";
import {GenericRepository} from "./generic.repositories";
import {SkillLevel} from "../../../../Domain/enums/skill-level.enum";
@Injectable()
export class SkillAssignmentRepositoryImpl
    extends GenericRepository<SkillAssignment, any>
    implements ISkillAssignmentRepository {

  constructor(prisma: PrismaService, mapper: SkillAssignmentMapper) {
    super(prisma, 'skillAssignment', mapper)
  }

  async findByStudentAndSkill(studentProfileId: string, skillId: number): Promise<SkillAssignment | null> {
    const result = await this.prisma.skillAssignment.findFirst({
      where: { studentProfileId, skillId }
    })
    return result ? this.mapper.toDomain(result) : null
  }

  async updateLevel(id: string, level: SkillLevel): Promise<SkillAssignment> {
    const result = await this.prisma.skillAssignment.update({
      where: { id },
      data: { level }
    })
    return this.mapper.toDomain(result)
  }
}