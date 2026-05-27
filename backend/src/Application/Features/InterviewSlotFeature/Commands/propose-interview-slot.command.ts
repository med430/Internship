export class ProposeInterviewSlotCommand {
    constructor(
        public readonly recruiterUserId: string,
        public readonly applicationId: string,
        public readonly startAt: Date,
        public readonly endAt: Date,
        public readonly notes?: string,
        public readonly parentSlotId?: string,
    ) {}
}