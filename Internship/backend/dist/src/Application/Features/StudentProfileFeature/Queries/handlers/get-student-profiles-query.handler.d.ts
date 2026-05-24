import { IQueryHandler } from '@nestjs/cqrs';
import { GetStudentProfilesQuery } from '../get-student-profiles.query';
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository';
import { StudentProfile } from '../../../../../Domain/entities/student-profile.entity';
export declare class GetStudentProfilesQueryHandler implements IQueryHandler<GetStudentProfilesQuery> {
    private readonly studentProfileRepository;
    constructor(studentProfileRepository: IStudentProfileRepository);
    execute(query: GetStudentProfilesQuery): Promise<StudentProfile[]>;
}
