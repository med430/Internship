import { IQueryHandler } from '@nestjs/cqrs';
import { ISkillRepository } from '../../../../repositories/skill.repository';
import { GetSkillQuery } from '../get-skill.query';
import { Skill } from '../../../../../Domain/entities/skill.entity';
export declare class GetSkillQueryHandler implements IQueryHandler<GetSkillQuery> {
    private readonly skillRepository;
    constructor(skillRepository: ISkillRepository);
    execute(query: GetSkillQuery): Promise<Skill | null>;
}
