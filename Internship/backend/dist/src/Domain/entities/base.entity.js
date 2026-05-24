"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
class BaseEntity {
    createdAt;
    updatedAt;
    deletedAt;
    constructor(createdAt, updatedAt, deletedAt) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=base.entity.js.map