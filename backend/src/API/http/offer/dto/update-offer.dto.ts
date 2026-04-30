import {
    IsOptional,
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
    @IsString()
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