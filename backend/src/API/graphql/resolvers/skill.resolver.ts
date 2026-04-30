import { Args, Query, Resolver } from '@nestjs/graphql';
import { Skill } from '../../../Domain/entities/skill.entity';
import { GetSkillsQuery } from '../../../Application/Features/SkillFeature/Queries/get-skills.query';
import { GetSkillQuery } from '../../../Application/Features/SkillFeature/Queries/get-skill.query';
import { QueryBus } from '@nestjs/cqrs';

@Resolver('Skill')
export class SkillResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query('skills')
  async getSkills(
    @Args('pageNumber') pageNumber: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Skill[]> {
    return this.queryBus.execute(new GetSkillsQuery(pageNumber, pageSize));
  }

  @Query('skill')
  async getSkill(@Args('id') id: string): Promise<Skill | null> {
    return this.queryBus.execute(new GetSkillQuery(id));
  }
}