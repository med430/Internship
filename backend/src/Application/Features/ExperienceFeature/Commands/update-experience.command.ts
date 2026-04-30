export class UpdateExperienceCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string,
        public readonly company?: string,
        public readonly role?: string,
        public readonly startDate?: Date,
        public readonly endDate?: Date,
        public readonly description?: string
    ) {}
}