// create-experience.dto.ts
import { IsString, IsOptional, IsDateString } from 'class-validator'

export class CreateExperienceDTO {
    @IsString()
    company: string

    @IsString()
    role: string

    @IsDateString()
    startDate: Date

    @IsOptional()
    @IsDateString()
    endDate?: Date

    @IsOptional()
    @IsString()
    description?: string
}