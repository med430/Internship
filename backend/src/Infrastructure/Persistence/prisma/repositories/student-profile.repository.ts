// infrastructure/repositories/student-profile.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { StudentProfileMapper } from '../mappers/student-profile.mapper'
import {GenericRepository} from "./generic.repositories";
import {IStudentProfileRepository} from "../../../../Application/repositories/student-profile.repository";
import {StudentProfile} from "../../../../Domain/entities/student-profile.entity";


const STUDENT_PROFILE_INCLUDE = {
  skills:         true,
  experiences:    true,
  projects:       true,
  educations:     true,
  certifications: true,
  cvs:            true,
} as const
@Injectable()
export class StudentProfileRepositoryImpl
    extends GenericRepository<StudentProfile, any>
    implements IStudentProfileRepository {

  // ← ajouter
  protected readonly includeOptions = {
    skills:         true,
    experiences:    true,
    projects:       true,
    educations:     true,
    certifications: true,
    cvs:            true,
  }

  constructor(prisma: PrismaService, mapper: StudentProfileMapper) {
    super(prisma, 'studentProfile', mapper)
  }

  // findById, findByUserId, update — tu peux supprimer STUDENT_PROFILE_INCLUDE
  // et simplifier puisque includeOptions est maintenant hérité
  async findById(id: string): Promise<StudentProfile | null> {
    const result = await this.prisma.studentProfile.findUnique({
      where: { id },
      include: this.includeOptions
    })
    return result ? this.mapper.toDomain(result) : null
  }

  async findByUserId(userId: string): Promise<StudentProfile | null> {
    const result = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: this.includeOptions
    })
    return result ? this.mapper.toDomain(result) : null
  }

  async findByDomain(domain: string): Promise<StudentProfile[]> {
    const results = await this.prisma.studentProfile.findMany({
      where: { domains: { has: domain } },
      include: this.includeOptions,
    })
    return results.map(r => this.mapper.toDomain(r))
  }

  async update(profile: StudentProfile): Promise<StudentProfile> {
    const result = await this.prisma.studentProfile.update({
      where: { id: profile.id },
      data: this.mapper.toPersistence(profile),
      include: this.includeOptions
    })
    return this.mapper.toDomain(result)
  }
}