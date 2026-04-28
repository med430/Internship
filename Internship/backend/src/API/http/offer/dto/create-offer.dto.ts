import {
    IsString,
    IsBoolean,
    IsEnum,
    IsDateString,
    IsArray,
    ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'

import { OfferType } from '../../../../Domain/enums/offer-type.enum'
import { WorkMode } from '../../../../Domain/enums/workMode'
import { SkillLevel } from '../../../../Domain/enums/skill-level.enum'

class SkillRequirementDTO {
    @IsString()
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

    @IsBoolean()
    isPaid: boolean

    @IsEnum(WorkMode)
    workMode: WorkMode

    @IsDateString()
    startDate: string

    @IsDateString()
    endDate: string

    @IsEnum(OfferType)
    type: OfferType

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SkillRequirementDTO)
    requiredSkills: SkillRequirementDTO[]
}