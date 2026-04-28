import { IsString, IsOptional } from 'class-validator'

export class ApplyToOfferDTO {

    @IsString()
    offerId: string

    @IsString()
    cvUrl: string

    @IsOptional()
    @IsString()
    coverLetterUrl?: string
}