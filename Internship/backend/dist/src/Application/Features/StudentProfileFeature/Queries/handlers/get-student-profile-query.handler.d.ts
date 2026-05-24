import { IQueryHandler } from '@nestjs/cqrs';
import { GetStudentProfileQuery } from '../get-student-profile.query';
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository';
import { StudentProfile } from '../../../../../Domain/entities/student-profile.entity';
export declare class GetStudentProfileQueryHandler implements IQueryHandler<GetStudentProfileQuery> {
    private readonly studentProfileRepository;
    constructor(studentProfileRepository: IStudentProfileRepository);
    execute(query: GetStudentProfileQuery): Promise<StudentProfile | null>;
}
