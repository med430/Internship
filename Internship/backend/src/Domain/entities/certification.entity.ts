
export class Certification {
    constructor(
        public readonly id: string,
        public readonly studentProfileId: string,

        public name: string,
        public organization: string,

        public issueDate: Date,
        public expirationDate?: Date,

        public credentialId?: string,
        public credentialUrl?: string
    ) {}
}