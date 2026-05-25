import {
    IsOptional,
    IsString,
    IsBoolean,
    IsEnum,
    IsIn,
    IsDateString,
    IsArray,
    ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'

import { OfferType } from '../../../../Domain/enums/offer-type.enum'
import { WorkMode } from '../../../../Domain/enums/workMode'
import { SkillLevel } from '../../../../Domain/enums/skill-level.enum'
import { CAREER_DOMAINS } from '../../../../Domain/constants/domains'

class SkillRequirementDTO {
    @IsString()
    skillName: string

    @IsEnum(SkillLevel)
    level: SkillLevel
}

export class UpdateOfferDTO {

    @IsOptional()
    @IsString()
    title?: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    company?: string

    @IsOptional()
    @IsString()
    location?: string

    @IsOptional()
    @IsIn(CAREER_DOMAINS)
    domain?: string

    @IsOptional()
    @IsBoolean()
    isPaid?: boolean

    @IsOptional()
    @IsEnum(WorkMode)
    workMode?: WorkMode

    @IsOptional()
    @IsDateString()
    startDate?: string

    @IsOptional()
    @IsDateString()
    endDate?: string

    @IsOptional()
    @IsEnum(OfferType)
    type?: OfferType

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SkillRequirementDTO)
    requiredSkills?: SkillRequirementDTO[]
}