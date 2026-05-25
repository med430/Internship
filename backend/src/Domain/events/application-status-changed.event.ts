import { ApplicationStatus } from '../enums/application-status.enum'

export class ApplicationStatusChangedEvent {
    constructor(
        public readonly studentUserId: string,
        public readonly applicationId: string,
        public readonly offerTitle: string,
        public readonly status: ApplicationStatus,
    ) {}
}