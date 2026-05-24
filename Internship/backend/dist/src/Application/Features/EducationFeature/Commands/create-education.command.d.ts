export declare class CreateEducationCommand {
    readonly userId: string;
    readonly school: string;
    readonly degree: string;
    readonly field: string;
    readonly startDate: Date;
    readonly endDate?: Date | undefined;
    readonly description?: string | undefined;
    constructor(userId: string, school: string, degree: string, field: string, startDate: Date, endDate?: Date | undefined, description?: string | undefined);
}
