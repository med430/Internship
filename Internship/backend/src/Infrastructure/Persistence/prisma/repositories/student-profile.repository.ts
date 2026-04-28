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

  constructor(
      prisma: PrismaService,
      mapper: StudentProfileMapper
  ) {
    super(prisma, 'studentProfile', mapper)
  }

  async findById(id: string): Promise<StudentProfile | null> {
    const result = await this.prisma.studentProfile.findUnique({
      where: { id },
      include: STUDENT_PROFILE_INCLUDE
    })
    return result ? this.mapper.toDomain(result) : null
  }

  async findByUserId(userId: string): Promise<StudentProfile | null> {
    const result = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: STUDENT_PROFILE_INCLUDE
    })
    return result ? this.mapper.toDomain(result) : null
  }

  async update(profile: StudentProfile): Promise<StudentProfile> {
    const result = await this.prisma.studentProfile.update({
      where: { id: profile.id },
      data: this.mapper.toPersistence(profile),
      include: STUDENT_PROFILE_INCLUDE
    })
    return this.mapper.toDomain(result)
  }
}