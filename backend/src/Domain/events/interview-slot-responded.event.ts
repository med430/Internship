import { InterviewSlotStatus } from '../enums/interview-slot-status.enum'

export class InterviewSlotRespondedEvent {
    constructor(
        public readonly recipientUserId: string,
        public readonly slotId: string,
        public readonly status: InterviewSlotStatus,
        public readonly offerTitle: string,
        public readonly startAt?: Date,
        public readonly endAt?: Date,
        public readonly studentEmail?: string,
        public readonly studentName?: string,
        public readonly recruiterEmail?: string,
        public readonly recruiterName?: string,
    ) {}
}
