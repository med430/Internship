export declare class UpdateCertificationCommand {
    readonly userId: string;
    readonly id: string;
    readonly name?: string | undefined;
    readonly organization?: string | undefined;
    readonly issueDate?: Date | undefined;
    readonly expirationDate?: Date | undefined;
    readonly credentialId?: string | undefined;
    readonly credentialUrl?: string | undefined;
    constructor(userId: string, id: string, name?: string | undefined, organization?: string | undefined, issueDate?: Date | undefined, expirationDate?: Date | undefined, credentialId?: string | undefined, credentialUrl?: string | undefined);
}
