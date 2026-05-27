import {SubscriptionType} from "../enums/subscription-type.enum";

export class Subscription {
    constructor(
        public readonly id: string,
        public studentProfileId: string,
        public type: SubscriptionType,
    ) {}
}