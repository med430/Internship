export class InterviewSlotProposedEvent {
    constructor(
        public readonly recipientUserId: string,
        public readonly slotId: string,
        public readonly applicationId: string,
        public readonly proposedByUserId: string,
        public readonly startAt: Date,
        public readonly endAt: Date,
        public readonly offerTitle: string,
    ) {}
}