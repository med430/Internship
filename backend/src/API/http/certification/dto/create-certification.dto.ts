// create-certification.dto.ts
import { IsString, IsOptional, IsDateString, IsUrl } from 'class-validator'

export class CreateCertificationDTO {
    @IsString()
    name: string

    @IsString()
    organization: string

    @IsDateString()
    issueDate: Date

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