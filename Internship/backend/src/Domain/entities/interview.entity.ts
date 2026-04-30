import { BaseEntity } from './base.entity'
import { InterviewStatus } from '../enums/interview-status.enum'
import { RecruiterMode } from '../enums/recruiter-mode.enum'

export type InterviewData = Record<string, unknown>

export class Interview extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly offerId?: string,

        public company?: string,
        public jobTitle?: string,
        public jobDescription?: string,

        public recruiterMode: RecruiterMode = RecruiterMode.EMPATHIC,
        public status: InterviewStatus = InterviewStatus.IN_PROGRESS,

        public score: number = 0,
        public feedback: string = '',

        public summary?: string,
        public data?: InterviewData,

        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt)
    }
}