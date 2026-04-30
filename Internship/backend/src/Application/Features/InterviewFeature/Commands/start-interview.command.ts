import { RecruiterMode } from '../../../../Domain/enums/recruiter-mode.enum'

export class StartInterviewCommand {
    constructor(
        public readonly userId: string,
        public readonly offerId?: string,
        public readonly company?: string,
        public readonly jobTitle?: string,
        public readonly jobDescription?: string,
        public readonly recruiterMode?: RecruiterMode,
        public readonly questionCount?: number,
    ) {}
}
