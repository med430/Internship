// domain/entities/recommendation.entity.ts

import {BaseEntity} from "./base.entity";

export class Recommendation extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly recruiterId: string,
        public readonly studentId: string,
        public readonly description: string,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt);
    }
}