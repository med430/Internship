import { ApplicationStatus } from "../../../../Domain/enums/application-status.enum";
export declare class UpdateApplicationStatusCommand {
    readonly applicationId: string;
    readonly userId: string;
    readonly status: ApplicationStatus;
    constructor(applicationId: string, userId: string, status: ApplicationStatus);
}
