// update-experience.dto.ts
import { IsString, IsOptional, IsDateString } from 'class-validator'

export class UpdateExperienceDTO {
    @IsOptional()
    @IsString()
    company?: string

    @IsOptional()
    @IsString()
    role?: string

    @IsOptional()
    @IsDateString()
    startDate?: Date

    @IsOptional()
    @IsDateString()
    endDate?: Date

    @IsOptional()
    @IsString()
    description?: string
}