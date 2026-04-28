// update-certification.dto.ts
import { IsString, IsOptional, IsDateString, IsUrl } from 'class-validator'

export class UpdateCertificationDTO {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    organization?: string

    @IsOptional()
    @IsDateString()
    issueDate?: Date

    @IsOptional()
    @IsDateString()
    expirationDate?: Date

    @IsOptional()
    @IsString()
    credentialId?: string

    @IsOptional()
    @IsUrl()
    credentialUrl?: string
}