import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudentProfileQuery } from '../get-student-profile.query';
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository';
import { StudentProfile } from '../../../../../Domain/entities/student-profile.entity';
import { Inject } from '@nestjs/common';

@QueryHandler(GetStudentProfileQuery)
export class GetStudentProfileQueryHandler implements IQueryHandler<GetStudentProfileQuery> {
  constructor(
    @Inject(IStudentProfileRepository)
    private readonly studentProfileRepository: IStudentProfileRepository,
  ) {}

  async execute(
    query: GetStudentProfileQuery,
  ): Promise<StudentProfile | null> {
    const byId = await this.studentProfileRepository.findById(query.id);
    if (byId) return byId;

    return this.studentProfileRepository.findByUserId(query.id);
  }
}
