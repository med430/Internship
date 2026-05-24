import { IQueryHandler } from '@nestjs/cqrs';
import { GetSkillsQuery } from '../get-skills.query';
import { ISkillRepository } from '../../../../repositories/skill.repository';
import { Skill } from '../../../../../Domain/entities/skill.entity';
export declare class GetSkillsQueryHandler implements IQueryHandler<GetSkillsQuery> {
    private readonly skillRepository;
    constructor(skillRepository: ISkillRepository);
    execute(query: GetSkillsQuery): Promise<Skill[]>;
}
