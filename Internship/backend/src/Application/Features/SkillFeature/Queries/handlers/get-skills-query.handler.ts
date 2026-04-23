import { QueryHandler } from '@nestjs/cqrs';
import { GetSkillsQuery } from '../get-skills.query';
import { ISkillRepository } from '../../../../repositories/skill.repository';
import { Skill } from '../../../../../Domain/entities/skill.entity';

@QueryHandler(GetSkillsQuery)
export class GetSkillsQueryHandler {
  constructor(
    private readonly skillRepository: ISkillRepository,
  ) {
  }

  async execute(query: GetSkillsQuery): Promise<Skill[]> {
    return this.skillRepository.findAll();
  }
}