export declare class UpdateOfferCommand {
    readonly offerId: string;
    readonly userId: string;
    readonly title?: string | undefined;
    readonly description?: string | undefined;
    readonly company?: string | undefined;
    readonly location?: string | undefined;
    readonly domain?: string | undefined;
    readonly isPaid?: boolean | undefined;
    readonly workMode?: any | undefined;
    readonly startDate?: Date | undefined;
    readonly endDate?: Date | undefined;
    readonly type?: any | undefined;
    readonly requiredSkills?: {
        skillId: number;
        level: any;
    }[] | undefined;
    constructor(offerId: string, userId: string, title?: string | undefined, description?: string | undefined, company?: string | undefined, location?: string | undefined, domain?: string | undefined, isPaid?: boolean | undefined, workMode?: any | undefined, startDate?: Date | undefined, endDate?: Date | undefined, type?: any | undefined, requiredSkills?: {
        skillId: number;
        level: any;
    }[] | undefined);
}
