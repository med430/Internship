"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recommendation = void 0;
const base_entity_1 = require("./base.entity");
class Recommendation extends base_entity_1.BaseEntity {
    id;
    recruiterId;
    studentId;
    description;
    constructor(id, recruiterId, studentId, description, createdAt, updatedAt, deletedAt) {
        super(createdAt, updatedAt, deletedAt);
        this.id = id;
        this.recruiterId = recruiterId;
        this.studentId = studentId;
        this.description = description;
    }
}
exports.Recommendation = Recommendation;
//# sourceMappingURL=recommendation.entity.js.map