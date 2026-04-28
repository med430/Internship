export class DeleteCertificationCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string
    ) {}
}