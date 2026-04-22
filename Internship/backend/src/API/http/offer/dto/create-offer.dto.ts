import {
    IsString,
    IsEnum,
    IsDateString,
    IsArray,
    ValidateNested,
    IsInt
} from 'class-validator'
import { Type } from 'class-transformer'

import { OfferType } from '../../../../Domain/enums/offer-type.enum'
import { SkillLevel } from '../../../../Domain/enums/skill-level.enum'

class SkillAssignmentDTO {
    @IsInt()
    skillId: number

    @IsEnum(SkillLevel)
    level: SkillLevel
}

export class CreateOfferDTO {

    @IsString()
    title: string

    @IsString()
    description: string

    @IsString()
    company: string

    @IsString()
    location: string

    @IsString()
    domain: string

    @IsDateString() // 🔥 IMPORTANT
    startDate: string

    @IsDateString() // 🔥 IMPORTANT
    endDate: string

    @IsEnum(OfferType)
    type: OfferType

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SkillAssignmentDTO)
    requiredSkills: SkillAssignmentDTO[]
}