export declare class RegisterRecruiterCommand {
    readonly email: string;
    readonly name: string;
    readonly lastname: string;
    readonly username: string;
    readonly password: string;
    readonly company: string;
    readonly companyDescription?: string | undefined;
    readonly website?: string | undefined;
    constructor(email: string, name: string, lastname: string, username: string, password: string, company: string, companyDescription?: string | undefined, website?: string | undefined);
}
