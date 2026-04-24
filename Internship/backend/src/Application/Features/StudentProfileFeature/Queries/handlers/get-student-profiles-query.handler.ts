import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudentProfilesQuery } from '../get-student-profiles.query';
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository';
import { StudentProfile } from '../../../../../Domain/entities/student-profile.entity';

@QueryHandler(GetStudentProfilesQuery)
export class GetStudentProfilesQueryHandler implements IQueryHandler<GetStudentProfilesQuery> {
  constructor(
    private readonly studentProfileRepository: IStudentProfileRepository,
  ) {}

  async execute(query: GetStudentProfilesQuery): Promise<StudentProfile[]> {
    return this.studentProfileRepository.findPaginated(
      query.pageNumber,
      query.pageSize,
    );
  }
}
