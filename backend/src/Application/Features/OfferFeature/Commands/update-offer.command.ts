export class UpdateOfferCommand {
    constructor(
        public readonly offerId: string,
        public readonly userId: string,

        public readonly title?: string,
        public readonly description?: string,
        public readonly company?: string,
        public readonly location?: string,
        public readonly domain?: string,

        public readonly isPaid?: boolean,
        public readonly workMode?: any,

        public readonly startDate?: Date,
        public readonly endDate?: Date,

        public readonly type?: any,

        public readonly requiredSkills?: {
            skillName: string
            level: any
        }[]
    ) {}
}