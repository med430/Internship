import { QueryBus } from '@nestjs/cqrs';
import { StudentProfile } from '../../../Domain/entities/student-profile.entity';
export declare class SkillAssignmentResolver {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    getStudentProfile(id: string): Promise<StudentProfile | null>;
    getStudentProfiles(pageNumber: number, pageSize: number): Promise<any>;
}
