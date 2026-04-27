export class UpdateApplicationStatusCommand {
    constructor(
        public readonly applicationId: string,
        public readonly recruiterId: string,
        public readonly status: 'ACCEPTED' | 'REJECTED'
    ) {}
}