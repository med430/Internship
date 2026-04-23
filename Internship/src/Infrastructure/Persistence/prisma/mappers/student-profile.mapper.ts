import { StudentProfile as Domain } from '../../../../Domain/entities/student-profile.entity';
import { SkillAssignment } from '../../../../Domain/entities/skill-assignment.entity';
import { CV } from '../../../../Domain/entities/cv.entity';
import { Application } from '../../../../Domain/entities/application.entity';
import {IGenericMapper} from "./generic.mapper";

export class StudentProfileMapper implements IGenericMapper<Domain, DB> {
  toDomain(data: any): Domain {
    return new Domain(
      data.userId,

      data.cvs?.map(
        (c: any) =>
          new CV(
            c.id,
            c.studentId,
            c.fileUrl,
            c.parsedData,
            c.skills,
            [],
            [],
            c.createdAt,
            c.updatedAt,
            c.deletedAt,
          ),
      ) || [],

      data.skills?.map((s: any) => new SkillAssignment(s.skill, s.level)) || [],

      data.applications?.map(
        (a: any) =>
          new Application(
            a.id,
            a.studentId,
            a.offerId,
            a.status,
            a.matchScore,
            a.createdAt,
            a.updatedAt,
            a.deletedAt,
          ),
      ) || [],
    );
  }
}
