import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { IStudentProfileRepository } from '../../../../Application/repositories/student-profile.repository'
import {StudentProfile} from "../../../../Domain/entities/student-profile.entity";
import { GenericRepository } from './generic.repositories';
import { StudentProfilePrismaMapper } from '../mappers/student-profile.mapper';

@Injectable()
export class StudentProfileRepository extends GenericRepository<StudentProfile, any> implements IStudentProfileRepository {
  constructor(protected prisma: PrismaService,
              protected mapper: StudentProfilePrismaMapper) {
    super(prisma, 'studentProfile', mapper);
  }

  async create(data: { id: string; userId: string; bio?: string }): Promise<void> {
    await this.prisma.studentProfile.create({
      data: {
        id: data.id,
        userId: data.userId,
        bio: data.bio ?? null
      },
    });
  }
  async findByUserId(userId: string): Promise<StudentProfile | null> {
    const res = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!res) return null

    return this.mapper.toDomain(res)
  }

  async update(profile: StudentProfile): Promise<StudentProfile> {
    const result = await this.prisma.studentProfile.update({
      where: { userId: profile.userId },
      data: {
        bio: profile.bio // 🔥 OK maintenant
      }
    })

    return this.mapper.toDomain(result)
  }

  async findAll(): Promise<StudentProfile[]> {
    const results = await this.prisma.studentProfile.findMany()

    return results.map((r) => this.mapper.toDomain(r))
  }
}