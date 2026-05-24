import { BaseEntity } from "./base.entity";
export declare class Certification extends BaseEntity {
    readonly id: string;
    readonly studentProfileId: string;
    name: string;
    organization: string;
    issueDate: Date;
    expirationDate?: Date | undefined;
    credentialId?: string | undefined;
    credentialUrl?: string | undefined;
    constructor(id: string, studentProfileId: string, name: string, organization: string, issueDate: Date, expirationDate?: Date | undefined, credentialId?: string | undefined, credentialUrl?: string | undefined, createdAt?: Date, updatedAt?: Date, deletedAt?: Date);
}
