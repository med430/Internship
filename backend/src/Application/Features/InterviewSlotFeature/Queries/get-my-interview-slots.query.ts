export class GetMyInterviewSlotsQuery {
    constructor(
        public readonly userId: string,
        public readonly role: 'STUDENT' | 'RECRUITER',
    ) {}
}