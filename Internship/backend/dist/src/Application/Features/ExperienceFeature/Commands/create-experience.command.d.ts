export declare class CreateExperienceCommand {
    readonly userId: string;
    readonly company: string;
    readonly role: string;
    readonly startDate: Date;
    readonly endDate?: Date | undefined;
    readonly description?: string | undefined;
    constructor(userId: string, company: string, role: string, startDate: Date, endDate?: Date | undefined, description?: string | undefined);
}
