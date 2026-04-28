import {BaseEntity} from "./base.entity";

export class Certification extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly studentProfileId: string,

        public name: string,
        public organization: string,

        public issueDate: Date,
        public expirationDate?: Date,

        public credentialId?: string,
        public credentialUrl?: string,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt);}
}