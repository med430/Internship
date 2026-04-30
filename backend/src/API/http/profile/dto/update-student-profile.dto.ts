// dto/update-student-profile.dto.ts
import { IsString, IsOptional, IsDateString, IsEnum, IsUrl } from 'class-validator'
import { Gender } from '../../../../Domain/enums/gender'

export class UpdateStudentProfileDto {
    // User fields
    @IsOptional()
    @IsString()
    name?: string

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
}