export class ApplicationSubmittedEvent {
    constructor(
        public readonly recruiterUserId: string,
        public readonly applicationId: string,
        public readonly offerTitle: string,
    ) {}
}