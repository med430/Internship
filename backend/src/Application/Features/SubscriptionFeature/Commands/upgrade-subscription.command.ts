export class UpgradeSubscriptionCommand {
    constructor(
        public readonly userId: string,  // User.id (Supabase sub)
    ) {}
}
