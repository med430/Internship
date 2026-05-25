export class ProfileView {
    constructor(
        public readonly id: string,
        public readonly recruiterUserId: string,
        public readonly studentProfileId: string,
        public viewedAt: Date,
        public offerId?: string,
    ) {}
}
