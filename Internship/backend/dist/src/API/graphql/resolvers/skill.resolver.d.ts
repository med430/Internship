import { Skill } from '../../../Domain/entities/skill.entity';
import { QueryBus } from '@nestjs/cqrs';
export declare class SkillResolver {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    getSkills(pageNumber: number, pageSize: number): Promise<Skill[]>;
    getSkill(id: string): Promise<Skill | null>;
}
