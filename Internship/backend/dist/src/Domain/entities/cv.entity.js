"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CV = void 0;
const base_entity_1 = require("./base.entity");
class CV extends base_entity_1.BaseEntity {
    id;
    studentId;
    fileUrl;
    constructor(id, studentId, fileUrl, createdAt, updatedAt, deletedAt) {
        super(createdAt, updatedAt, deletedAt);
        this.id = id;
        this.studentId = studentId;
        this.fileUrl = fileUrl;
    }
}
exports.CV = CV;
//# sourceMappingURL=cv.entity.js.map