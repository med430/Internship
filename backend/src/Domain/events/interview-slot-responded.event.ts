import { InterviewSlotStatus } from '../enums/interview-slot-status.enum'

export class InterviewSlotRespondedEvent {
    constructor(
        public readonly recipientUserId: string,
        public readonly slotId: string,
        public readonly status: InterviewSlotStatus,
        public readonly offerTitle: string,
    ) {}
}