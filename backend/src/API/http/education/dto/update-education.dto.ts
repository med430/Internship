// update-education.dto.ts
import { IsString, IsOptional, IsDateString } from 'class-validator'

export class UpdateEducationDTO {
    @IsOptional()
    @IsString()
    school?: string

    @IsOptional()
    @IsString()
    degree?: string

    @IsOptional()
    @IsString()
    field?: string

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