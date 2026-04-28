// dto/update-recruiter-profile.dto.ts
import { IsString, IsOptional, IsUrl } from 'class-validator'

export class UpdateRecruiterProfileDto {
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

    // RecruiterProfile fields
    @IsOptional()
    @IsString()
    company?: string

    @IsOptional()
    @IsString()
    companyDescription?: string

    @IsOptional()
    @IsUrl()
    website?: string
}