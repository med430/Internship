// infrastructure/mappers/student-profile.mapper.ts
import {Injectable} from '@nestjs/common'
import {
  Certification as PrismaCertification,
  CV as PrismaCV,
  Education as PrismaEducation,
  Experience as PrismaExperience,
  Project as PrismaProject,
  SkillAssignment as PrismaSkillAssignment,
  StudentProfile as PrismaStudentProfile,
} from '@prisma/client'
import {IGenericMapper} from './generic.mapper'
import {StudentProfile} from "../../../../Domain/entities/student-profile.entity";
import {Experience} from "../../../../Domain/entities/experience.entity";
import {SkillLevel} from "../../../../Domain/enums/skill-level.enum";
import {CV} from "../../../../Domain/entities/cv.entity";
import {Certification} from "../../../../Domain/entities/certification.entity";
import {SkillAssignment} from "../../../../Domain/entities/skill-assignment.entity";
import {Gender} from "../../../../Domain/enums/gender";
import {Education} from "../../../../Domain/entities/education.entity";
import {Project} from "../../../../Domain/entities/project.entity";

type PrismaStudentProfileFull = PrismaStudentProfile & {
  skills:         PrismaSkillAssignment[]
  experiences:    PrismaExperience[]
  projects:       PrismaProject[]
  educations:     PrismaEducation[]
  certifications: PrismaCertification[]
  cvs:            PrismaCV[]
}

@Injectable()
export class StudentProfileMapper implements IGenericMapper<StudentProfile, PrismaStudentProfileFull> {

  toDomain(raw: PrismaStudentProfileFull): StudentProfile {
    return new StudentProfile(
        raw.id,
        raw.userId,
        raw.bio        ?? undefined,
        raw.birthDate  ?? undefined,
        raw.gender     ? (raw.gender as Gender) : undefined,
        raw.address    ?? undefined,
        raw.city       ?? undefined,
        raw.skills.map(s => new SkillAssignment(
            s.id,
            s.skillId,
            s.studentProfileId!,
            s.level as SkillLevel
        )),
        raw.experiences.map(e => new Experience(
            e.id,
            e.studentProfileId,
            e.company,
            e.role,
            e.startDate,
            e.endDate      ?? undefined,
            e.description  ?? undefined,
            e.createdAt,
            e.updatedAt,
            e.deletedAt    ?? undefined,
        )),
        raw.projects.map(p => new Project(
            p.id,
            p.studentProfileId,
            p.title,
            p.description,
            p.technologies,
            p.githubUrl  ?? undefined,
            p.demoUrl    ?? undefined,
        )),
        raw.educations.map(e => new Education(
            e.id,
            e.studentProfileId,
            e.school,
            e.degree,
            e.field,
            e.startDate,
            e.endDate      ?? undefined,
            e.description  ?? undefined,
            e.createdAt,
            e.updatedAt,
            e.deletedAt    ?? undefined,
        )),
        raw.certifications.map(c => new Certification(
            c.id,
            c.studentProfileId,
            c.name,
            c.organization,
            c.issueDate,
            c.expirationDate ?? undefined,
            c.credentialId   ?? undefined,
            c.credentialUrl  ?? undefined,
            c.createdAt,
            c.updatedAt,
            c.deletedAt      ?? undefined,
        )),
        raw.cvs.map(cv => new CV(
            cv.id,
            cv.studentId,
            cv.fileUrl,
            cv.createdAt,
            cv.updatedAt,
            cv.deletedAt ?? undefined,
        )),
        raw.domains ?? [],
    )
  }

  toPersistence(domain: StudentProfile): Omit<PrismaStudentProfile, 'createdAt' | 'updatedAt'> {
    return {
      id:        domain.id,
      userId:    domain.userId,
      bio:       domain.bio       ?? null,
      birthDate: domain.birthDate ?? null,
      gender:    domain.gender    ?? null,
      address:   domain.address   ?? null,
      city:      domain.city      ?? null,
      domains:   domain.domains   ?? [],

      // Recommendation preferences 
      preferredDomains:    [],
      preferredCities:     [],
      preferredWorkMode:   null,
      availableFrom:       null,
      availableTo:         null,
      paidOnly:            false,
      preferredOfferTypes: [],
      languages:           [],
      maxCommuteCities:    [],
      schoolId:            null,
      currentYear:         null,
      currentProgram:      null,
    }
  }
}