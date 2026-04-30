export class WithdrawApplicationCommand {
    constructor(
        public readonly applicationId: string,
        public readonly userId: string
    ) {}
}