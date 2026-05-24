export declare class ApplyToOfferCommand {
    readonly userId: string;
    readonly offerId: string;
    readonly cvId: string;
    readonly coverLetterId?: string | undefined;
    constructor(userId: string, offerId: string, cvId: string, coverLetterId?: string | undefined);
}
