export declare abstract class BaseEntity {
    readonly createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: Date | undefined;
    constructor(createdAt?: Date | undefined, updatedAt?: Date | undefined, deletedAt?: Date | undefined);
}
