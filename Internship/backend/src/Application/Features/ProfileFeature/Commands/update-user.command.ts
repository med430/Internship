export class UpdateUserCommand {
    constructor(
        public readonly userId: string,
        public readonly dto: {
            name?: string
            lastname?: string
            username?: string
            password?: string
            company?: string
            bio?: string
        }
    ) {}
}