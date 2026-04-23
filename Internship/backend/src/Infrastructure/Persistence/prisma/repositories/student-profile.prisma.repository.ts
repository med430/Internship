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

  async create(data: { id: string; userId: string }): Promise<void> {
    await this.prisma.studentProfile.create({
      data,
    });
  }
  async findByUserId(userId: string): Promise<StudentProfile | null> {
    const res = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!res) return null;

    return new StudentProfile(
      res.id,
      res.userId,
      [], // cvs (tu peux laisser vide)
      [], // skills
      [], // applications
    );
  }

  async findAll(): Promise<StudentProfile[]> {
    const results = await this.prisma.skill.findMany();
    return results.map((r) => this.mapper.toDomain(r));
  }
}