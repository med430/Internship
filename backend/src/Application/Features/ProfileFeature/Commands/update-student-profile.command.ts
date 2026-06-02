// Carries every student field, including the preferences that drive recommendation matching.

import { Gender } from '../../../../Domain/enums/gender'
import { WorkMode } from '../../../../Domain/enums/workMode'
import { OfferType } from '../../../../Domain/enums/offer-type.enum'

export class UpdateStudentProfileCommand {
    constructor(
        public readonly userId: string,
        // User fields
        public readonly name?: string,
        public readonly lastname?: string,
        public readonly email?: string,
        public readonly username?: string,
        public readonly phone?: string,
        public readonly avatarUrl?: string,
        // Profile fields
        public readonly bio?: string,
        public readonly birthDate?: Date,
        public readonly gender?: Gender,
        public readonly address?: string,
        public readonly city?: string,
        public readonly domains?: string[],
        // School + program (drives availability-score and segmentation later)
        public readonly schoolId?: number | null,
        public readonly currentYear?: number | null,
        public readonly currentProgram?: string | null,
        // What the recommender uses to rank offers
        public readonly preferredCities?: string[],
        public readonly preferredDomains?: string[],
        public readonly preferredOfferTypes?: OfferType[],
        public readonly preferredWorkMode?: WorkMode | null,
        public readonly languages?: string[],
        public readonly paidOnly?: boolean,
        public readonly availableFrom?: Date | null,
        public readonly availableTo?: Date | null,
    ) {}
}
