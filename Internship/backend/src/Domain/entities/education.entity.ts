import {BaseEntity} from "./base.entity";

export class Education extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly studentProfileId: string,

        public school: string,
        public degree: string,
        public field: string,

        public startDate: Date,
        public endDate?: Date,

        public description?: string,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt);
}}