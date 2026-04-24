import { Injectable } from '@nestjs/common';
import { StudentProfile as Domain } from '../../../../Domain/entities/student-profile.entity';
import { StudentProfile as DB } from '@prisma/client';

import { SkillAssignmentPrismaMapper } from './skill-assignment.mapper';
import { ApplicationPrismaMapper } from './application.mapper';
import { CVPrismaMapper } from './cv.mapper';
import { IGenericMapper } from './generic.mapper';

@Injectable()
export class StudentProfilePrismaMapper implements IGenericMapper<Domain, DB> {
  constructor(
    private readonly skillMapper: SkillAssignmentPrismaMapper,
    private readonly applicationMapper: ApplicationPrismaMapper,
    private readonly cvMapper: CVPrismaMapper,
  ) {}

  toDomain(entity: any): Domain {
    return new Domain(
      entity.id,
      entity.userId,

      // ✅ CVs
      entity.cvs ? entity.cvs.map((cv: any) => this.cvMapper.toDomain(cv)) : [],

      // ✅ Skills (SkillAssignment)
      entity.skills
        ? entity.skills.map((s: any) => this.skillMapper.toDomain(s))
        : [],

      // ✅ Applications
      entity.applications
        ? entity.applications.map((a: any) =>
            this.applicationMapper.toDomain(a),
          )
        : [],
    );
  }

  toPersistence(domain: Domain) {
    return {
      id: domain.id,
      userId: domain.userId,

      // ❗ relations handled separately in Prisma (create/connect)
    };
  }
}
