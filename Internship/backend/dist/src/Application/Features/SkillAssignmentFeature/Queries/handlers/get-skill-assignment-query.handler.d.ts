import { IQueryHandler } from '@nestjs/cqrs';
import { GetSkillAssignmentQuery } from '../get-skill-assignment.query';
import { ISkillAssignmentRepository } from '../../../../repositories/skill-assignment.repository';
import { SkillAssignment } from '../../../../../Domain/entities/skill-assignment.entity';
export declare class GetSkillAssignmentQueryHandler implements IQueryHandler<GetSkillAssignmentQuery> {
    private readonly skillAssignmentRepository;
    constructor(skillAssignmentRepository: ISkillAssignmentRepository);
    execute(query: GetSkillAssignmentQuery): Promise<SkillAssignment | null>;
}
