// dto/update-student-profile.dto.ts
import { IsString, IsOptional, IsDateString, IsEnum, IsUrl, IsArray, IsIn } from 'class-validator'
import { Gender } from '../../../../Domain/enums/gender'
import { CAREER_DOMAINS } from '../../../../Domain/constants/domains'

export class UpdateStudentProfileDto {
    // User fields
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    email?: string

    @IsOptional()
    @IsString()
    lastname?: string

    @IsOptional()
    @IsString()
    username?: string

    @IsOptional()
    @IsString()
    phone?: string

    @IsOptional()
    @IsUrl()
    avatarUrl?: string

    // StudentProfile fields
    @IsOptional()
    @IsString()
    bio?: string

    @IsOptional()
    @IsDateString()
    birthDate?: Date

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender

    @IsOptional()
    @IsString()
    address?: string

    @IsOptional()
    @IsString()
    city?: string

    @IsOptional()
    @IsArray()
    @IsIn([...CAREER_DOMAINS], { each: true })
    domains?: string[]
}