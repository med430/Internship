export class ApplicationWithdrawnEvent {
    constructor(
        public readonly recruiterUserId: string,
        public readonly applicationId: string,
        public readonly offerTitle: string,
    ) {}
}