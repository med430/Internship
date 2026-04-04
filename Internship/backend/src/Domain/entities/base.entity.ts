export abstract class BaseEntity {
    constructor(
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date,
        public readonly deletedAt?: Date,
    ) {}
}