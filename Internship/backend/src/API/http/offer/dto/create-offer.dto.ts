import {OfferType} from "../../../../Domain/enums/offer-type.enum";

export class CreateOfferDTO {
    title: string
    description: string
    type: OfferType

    requiredSkills: {
        skillId: number
        level: string
    }[]
}