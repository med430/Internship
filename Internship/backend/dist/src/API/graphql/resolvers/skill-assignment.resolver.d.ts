import { SkillAssignment } from '../../../Domain/entities/skill-assignment.entity';
import { QueryBus } from '@nestjs/cqrs';
export declare class SkillAssignmentResolver {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    getSkillAssignment(id: string): Promise<SkillAssignment | null>;
    getSkillAssignments(pageNumber: number, pageSize: number): Promise<any>;
}
