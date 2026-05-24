export declare class UpdateEducationCommand {
    readonly userId: string;
    readonly id: string;
    readonly school?: string | undefined;
    readonly degree?: string | undefined;
    readonly field?: string | undefined;
    readonly startDate?: Date | undefined;
    readonly endDate?: Date | undefined;
    readonly description?: string | undefined;
    constructor(userId: string, id: string, school?: string | undefined, degree?: string | undefined, field?: string | undefined, startDate?: Date | undefined, endDate?: Date | undefined, description?: string | undefined);
}
