export declare class CreateOfferCommand {
    readonly userId: string;
    readonly title: string;
    readonly description: string;
    readonly company: string;
    readonly location: string;
    readonly domain: string;
    readonly isPaid: boolean;
    readonly workMode: any;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly type: any;
    readonly requiredSkills: {
        skillId: number;
        level: any;
    }[];
    constructor(userId: string, title: string, description: string, company: string, location: string, domain: string, isPaid: boolean, workMode: any, startDate: Date, endDate: Date, type: any, requiredSkills: {
        skillId: number;
        level: any;
    }[]);
}
