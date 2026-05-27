export class CancelSubscriptionCommand {
    constructor(
        public readonly userId: string,  // User.id (Supabase sub)
    ) {}
}
