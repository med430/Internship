export class Education {
    constructor(
        public readonly id: string,
        public readonly studentProfileId: string,

        public school: string,
        public degree: string,
        public field: string,

        public startDate: Date,
        public endDate?: Date,

        public description?: string
    ) {}
}