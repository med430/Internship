// Commands/register-recruiter.command.ts
export class RegisterRecruiterCommand {
    constructor(
        public readonly email: string,
        public readonly name: string,
        public readonly lastname: string,
        public readonly username: string,
        public readonly password: string,
        public readonly company: string,
        public readonly companyDescription?: string,
        public readonly website?: string
    ) {}
}