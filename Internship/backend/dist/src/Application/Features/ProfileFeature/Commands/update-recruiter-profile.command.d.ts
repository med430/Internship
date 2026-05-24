export declare class UpdateRecruiterProfileCommand {
    readonly userId: string;
    readonly name?: string | undefined;
    readonly lastname?: string | undefined;
    readonly username?: string | undefined;
    readonly phone?: string | undefined;
    readonly avatarUrl?: string | undefined;
    readonly company?: string | undefined;
    readonly companyDescription?: string | undefined;
    readonly website?: string | undefined;
    constructor(userId: string, name?: string | undefined, lastname?: string | undefined, username?: string | undefined, phone?: string | undefined, avatarUrl?: string | undefined, company?: string | undefined, companyDescription?: string | undefined, website?: string | undefined);
}
