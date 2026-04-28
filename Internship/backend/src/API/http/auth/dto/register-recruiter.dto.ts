// dto/register-recruiter.dto.ts
import { IsEmail, IsString, IsOptional, IsUrl, MinLength } from 'class-validator'

export class RegisterRecruiterDto {
    @IsEmail()
    email: string

    @IsString()
    name: string

    @IsString()
    lastname: string

    @IsString()
    @MinLength(3)
    username: string

    @IsString()
    @MinLength(6)
    password: string

    @IsString()
    company: string

    @IsOptional()
    @IsString()
    companyDescription?: string

    @IsOptional()
    @IsUrl()
    website?: string
}