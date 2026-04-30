import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { RecruiterMode } from '../../../../Domain/enums/recruiter-mode.enum'

export class StartInterviewDTO {
    @IsOptional()
    @IsString()
    offerId?: string

    @IsOptional()
    @IsString()
    company?: string

    @IsOptional()
    @IsString()
    jobTitle?: string

    @IsOptional()
    @IsString()
    jobDescription?: string

    @IsOptional()
    @IsEnum(RecruiterMode)
    recruiterMode?: RecruiterMode

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    questionCount?: number
}