import {BaseEntity} from "./base.entity";

export class Experience extends BaseEntity{
    constructor(
        public readonly id: string,
        public readonly studentProfileId: string,

        public company: string,
        public role: string,

        public startDate: Date,
        public endDate?: Date,

        public description?: string,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
) {
    super(createdAt, updatedAt, deletedAt);
}
}