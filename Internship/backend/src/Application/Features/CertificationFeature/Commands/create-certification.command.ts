export class CreateCertificationCommand {
    constructor(
        public readonly userId: string,
        public readonly name: string,
        public readonly organization: string,
        public readonly issueDate: Date,
        public readonly expirationDate?: Date,
        public readonly credentialId?: string,
        public readonly credentialUrl?: string
    ) {}
}