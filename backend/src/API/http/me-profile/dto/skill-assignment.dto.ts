// Body shapes for the student's own skill-assignment endpoints under /me/skills.

import { IsEnum, IsInt, Min } from 'class-validator'
import { SkillLevel } from '../../../../Domain/enums/skill-level.enum'

export class AddMySkillDto {
    @IsInt() @Min(1) skillId!: number
    @IsEnum(SkillLevel) level!: SkillLevel
}

export class UpdateMySkillDto {
    @IsEnum(SkillLevel) level!: SkillLevel
}
