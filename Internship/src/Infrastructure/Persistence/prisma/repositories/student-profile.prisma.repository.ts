import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StudentProfileMapper } from '../mappers/student-profile.mapper';
import { StudentProfile as Domain } from '../../../../Domain/entities/student-profile.entity';
import { StudentProfile as DB } from '@prisma/client';
import { GenericRepository } from './generic.repositories';

@Injectable()
export class StudentProfileRepository extends GenericRepository<Domain, DB> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: StudentProfileMapper,
  ) {
    const modelName: keyof PrismaService = 'studentProfile';
    super(prisma, modelName, mapper);
  }

  async findByUserId(userId: string): Promise<Domain | null> {
    const result = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        cvs: true,
        skills: {
          include: {
            skill: true,
          },
        },
        applications: true,
      },
    });

    return result ? this.mapper.toDomain(result) : null;
  }
}
