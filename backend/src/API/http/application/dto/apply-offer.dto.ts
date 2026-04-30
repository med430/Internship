// apply-to-offer.dto.ts
import { IsString, IsOptional, IsUrl } from 'class-validator'

export class ApplyToOfferDTO {
    @IsString()
    offerId: string

    @IsUrl()
    cvUrl: string

    @IsOptional()
    @IsUrl()
    coverLetterUrl?: string
}