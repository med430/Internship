import { IQueryHandler } from '@nestjs/cqrs';
import { GetSkillAssignmentsQuery } from '../get-skill-assignments.query';
import { ISkillAssignmentRepository } from '../../../../repositories/skill-assignment.repository';
import { SkillAssignment } from '../../../../../Domain/entities/skill-assignment.entity';
export declare class GetSkillAssignmentsQueryHandler implements IQueryHandler<GetSkillAssignmentsQuery> {
    private readonly skillAssignmentRepository;
    constructor(skillAssignmentRepository: ISkillAssignmentRepository);
    execute(query: GetSkillAssignmentsQuery): Promise<SkillAssignment[]>;
}
