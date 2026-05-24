export declare class UpdateExperienceCommand {
    readonly userId: string;
    readonly id: string;
    readonly company?: string | undefined;
    readonly role?: string | undefined;
    readonly startDate?: Date | undefined;
    readonly endDate?: Date | undefined;
    readonly description?: string | undefined;
    constructor(userId: string, id: string, company?: string | undefined, role?: string | undefined, startDate?: Date | undefined, endDate?: Date | undefined, description?: string | undefined);
}
