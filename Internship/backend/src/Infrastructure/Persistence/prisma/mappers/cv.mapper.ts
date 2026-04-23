import { Injectable } from '@nestjs/common';
import { CV as Domain } from '../../../../Domain/entities/cv.entity';
import { CV as DB } from '@prisma/client';

import { Project } from '../../../../Domain/entities/project.entity';
import { Experience } from '../../../../Domain/entities/experience.entity';

@Injectable()
export class CVPrismaMapper {
  toDomain(entity: any): Domain {
    return new Domain(
      entity.id,
      entity.studentId,

      entity.fileUrl,

      entity.parsedData,

      entity.skills ?? [],

      // ✅ Projects
      entity.projects
        ? entity.projects.map(
            (p: any) =>
              new Project(
                p.id,
                p.cvId,
                p.title,
                p.description,
                p.technologies ?? [],
              ),
          )
        : [],

      // ✅ Experiences
      entity.experiences
        ? entity.experiences.map(
            (e: any) =>
              new Experience(
                e.id,
                e.cvId,
                e.company,
                e.role,
                e.duration,
                e.description ?? undefined,
              ),
          )
        : [],

      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt ?? undefined,
    );
  }

  toPersistence(domain: Domain): DB {
    return {
      id: domain.id,
      studentId: domain.studentId,

      fileUrl: domain.fileUrl,
      parsedData: domain.parsedData,

      skills: domain.skills ?? [],

      createdAt: domain.createdAt!,
      updatedAt: domain.updatedAt!,
      deletedAt: domain.deletedAt ?? null,
    } as DB;
  }
}
