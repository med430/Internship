export class RespondToInterviewSlotCommand {
    constructor(
        public readonly studentUserId: string,
        public readonly slotId: string,
        public readonly action: 'accept' | 'decline' | 'counter',
        public readonly counterStartAt?: Date,
        public readonly counterEndAt?: Date,
        public readonly counterNotes?: string,
    ) {}
}