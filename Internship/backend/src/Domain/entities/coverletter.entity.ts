// cover-letter.entity.ts
import { BaseEntity } from "./base.entity";

export class CoverLetter extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public fileUrl: string,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt);
    }
}