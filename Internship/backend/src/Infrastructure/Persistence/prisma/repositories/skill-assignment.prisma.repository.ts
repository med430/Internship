import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SkillAssignment as Domain } from '../../../../Domain/entities/skill-assignment.entity';
import { SkillAssignment as DB } from '@prisma/client';
import { GenericRepository } from './generic.repositories';
import { SkillAssignmentPrismaMapper } from '../mappers/skill-assignment.mapper';

@Injectable()
export class SkillAssignmentRepository extends GenericRepository<Domain, DB> {
  constructor(prisma: PrismaService, mapper: SkillAssignmentPrismaMapper) {
    const modelName: keyof PrismaService = 'skillAssignment';
    super(prisma, modelName, mapper);
  }

  async findByStudent(studentId: string) {
    const result = await this.prisma.skillAssignment.findMany({
      where: { studentProfileId: studentId },
      include: {
        skill: true,
      },
    });

    return result.map((r) => this.mapper.toDomain(r as any));
  }
}
