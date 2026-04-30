// create-education.dto.ts
import { IsString, IsOptional, IsDateString } from 'class-validator'

export class CreateEducationDTO {
    @IsString()
    school: string

    @IsString()
    degree: string

    @IsString()
    field: string

    @IsDateString()
    startDate: Date

    @IsOptional()
    @IsDateString()
    endDate?: Date

    @IsOptional()
    @IsString()
    description?: string
}