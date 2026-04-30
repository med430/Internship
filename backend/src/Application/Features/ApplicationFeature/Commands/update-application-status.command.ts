import {ApplicationStatus} from "../../../../Domain/enums/application-status.enum";

export class UpdateApplicationStatusCommand {
    constructor(
        public readonly applicationId: string,
        public readonly userId: string,
        public readonly status: ApplicationStatus
    ) {}
}