import { InterviewSlotStatus } from '../enums/interview-slot-status.enum'

export class InterviewSlot {
    constructor(
        public readonly id: string,
        public readonly applicationId: string,
        public readonly proposedByUserId: string,
        public readonly startAt: Date,
        public readonly endAt: Date,
        public status: InterviewSlotStatus,
        public readonly notes: string | null,
        public readonly parentSlotId: string | null,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date,
    ) {}
}