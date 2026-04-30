export class UpdateCertificationCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string,
        public readonly name?: string,
        public readonly organization?: string,
        public readonly issueDate?: Date,
        public readonly expirationDate?: Date,
        public readonly credentialId?: string,
        public readonly credentialUrl?: string
    ) {}
}