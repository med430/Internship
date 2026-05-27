// Body shape for PATCH /me/profile. Every field is optional — partial updates are the norm.

import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator'
import { WorkMode } from '../../../../Domain/enums/workMode'
import { OfferType } from '../../../../Domain/enums/offer-type.enum'

export class UpdateMeProfileDto {
    @IsOptional() @IsString() @MaxLength(80)            name?: string
    @IsOptional() @IsString() @MaxLength(80)            lastname?: string
    @IsOptional() @IsString() @MaxLength(40)            username?: string
    @IsOptional() @IsString() @MaxLength(40)            phone?: string
    @IsOptional() @IsString() @MaxLength(500)           avatarUrl?: string

    @IsOptional() @IsString() @MaxLength(1000)          bio?: string
    @IsOptional() @IsDateString()                        birthDate?: string
    @IsOptional() @IsString() @MaxLength(40)            gender?: string
    @IsOptional() @IsString() @MaxLength(120)           address?: string
    @IsOptional() @IsString() @MaxLength(80)            city?: string
    @IsOptional() @IsArray() @IsString({ each: true })  domains?: string[]

    // School + program. `null` clears them.
    @ValidateIf((_, v) => v !== null) @IsOptional() @IsInt() @Min(1)              schoolId?: number | null
    @ValidateIf((_, v) => v !== null) @IsOptional() @IsInt() @Min(1) @Max(7)      currentYear?: number | null
    @ValidateIf((_, v) => v !== null) @IsOptional() @IsString() @MaxLength(120)   currentProgram?: string | null

    // Preferences the recommender ranks against.
    @IsOptional() @IsArray() @IsString({ each: true })  preferredCities?: string[]
    @IsOptional() @IsArray() @IsString({ each: true })  preferredDomains?: string[]
    @IsOptional() @IsArray() @IsEnum(OfferType, { each: true })  preferredOfferTypes?: OfferType[]
    @ValidateIf((_, v) => v !== null) @IsOptional() @IsEnum(WorkMode)  preferredWorkMode?: WorkMode | null
    @IsOptional() @IsArray() @IsString({ each: true })  languages?: string[]
    @IsOptional() @IsBoolean()                          paidOnly?: boolean
    @ValidateIf((_, v) => v !== null) @IsOptional() @IsDateString()  availableFrom?: string | null
    @ValidateIf((_, v) => v !== null) @IsOptional() @IsDateString()  availableTo?: string | null
}
