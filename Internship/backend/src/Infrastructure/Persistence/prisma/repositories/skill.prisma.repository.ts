import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GenericRepository } from './generic.repositories';
import { Skill as SkillDomain } from '../../../../Domain/entities/skill.entity';
import { Skill as SkillDB } from '@prisma/client';
import { SkillPrismaMapper } from '../mappers/skill.mapper';

@Injectable()
export class SkillRepository extends GenericRepository<SkillDomain, SkillDB> {
  constructor(prisma: PrismaService, mapper: SkillPrismaMapper) {
    const modelName: keyof PrismaService = 'skill';
    super(prisma, modelName, mapper);
  }
}
