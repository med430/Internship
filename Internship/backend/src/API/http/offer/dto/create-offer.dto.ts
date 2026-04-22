import {OfferType} from "../../../../Domain/enums/offer-type.enum";

export class CreateOfferDTO {
    title: string
    description: string

    company: string
    location: string
    domain: string

    startDate: Date
    endDate: Date

    type: OfferType

    requiredSkills: {
        skillId: number
        level: string
    }[]
}