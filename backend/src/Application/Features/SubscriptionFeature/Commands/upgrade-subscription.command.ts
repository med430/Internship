export class UpgradeSubscriptionCommand {
    constructor(
        public readonly userId: string,
        public readonly stripeCustomerId: string | null = null,
        public readonly stripeSubscriptionId: string | null = null,
    ) {}
}
