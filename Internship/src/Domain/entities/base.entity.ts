export abstract class BaseEntity {
    constructor(
        public readonly createdAt?: Date,
        public updatedAt?: Date,
        public  deletedAt?: Date,
    ) {}
}