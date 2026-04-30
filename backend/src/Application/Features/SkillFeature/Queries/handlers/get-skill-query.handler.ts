import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ISkillRepository } from '../../../../repositories/skill.repository';
import { GetSkillQuery } from '../get-skill.query';
import { Skill } from '../../../../../Domain/entities/skill.entity';

@QueryHandler(GetSkillQuery)
export class GetSkillQueryHandler implements IQueryHandler<GetSkillQuery> {
  constructor(
    private readonly skillRepository: ISkillRepository,
  ) {
  }

  async execute(query: GetSkillQuery): Promise<Skill | null> {
    return this.skillRepository.findById(Number(query.id));
  }
}