// Commands/update-recruiter-profile.command.ts
export class UpdateRecruiterProfileCommand {
    constructor(
        public readonly userId: string,
        // User fields
        public readonly name?: string,
        public readonly lastname?: string,
        public readonly username?: string,
        public readonly phone?: string,
        public readonly avatarUrl?: string,
        // RecruiterProfile fields
        public readonly company?: string,
        public readonly companyDescription?: string,
        public readonly website?: string,
    ) {}
}