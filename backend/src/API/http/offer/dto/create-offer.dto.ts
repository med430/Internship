import {
    IsString,
    IsBoolean,
    IsEnum,
    IsIn,
    IsDateString,
    IsArray,
    ValidateNested,
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
export class CreateOfferDTO {

    @IsString()
    title: string

    @IsString()
    description: string

    @IsString()
    company: string

    @IsString()
    location: string

    @IsIn(CAREER_DOMAINS)
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