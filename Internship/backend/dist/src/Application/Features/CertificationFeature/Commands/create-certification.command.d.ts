export declare class CreateCertificationCommand {
    readonly userId: string;
    readonly name: string;
    readonly organization: string;
    readonly issueDate: Date;
    readonly expirationDate?: Date | undefined;
    readonly credentialId?: string | undefined;
    readonly credentialUrl?: string | undefined;
    constructor(userId: string, name: string, organization: string, issueDate: Date, expirationDate?: Date | undefined, credentialId?: string | undefined, credentialUrl?: string | undefined);
}
