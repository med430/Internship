import { IsInt, IsEnum } from 'class-validator'
import { SkillLevel } from '../../../Domain/enums/skill-level.enum'

export class AssignSkillDTO {
    @IsInt()
    skillId: number

    @IsEnum(SkillLevel)
    level: SkillLevel
}