import { IsString } from 'class-validator'

export class ApplyOfferDTO {
    @IsString()
    offerId: string

}