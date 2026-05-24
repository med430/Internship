"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const base_entity_1 = require("./base.entity");
class Application extends base_entity_1.BaseEntity {
    id;
    studentId;
    offerId;
    cvId;
    status;
    matchScore;
    coverLetterId;
    constructor(id, studentId, offerId, cvId, status, matchScore, coverLetterId, createdAt, updatedAt, deletedAt) {
        super(createdAt, updatedAt, deletedAt);
        this.id = id;
        this.studentId = studentId;
        this.offerId = offerId;
        this.cvId = cvId;
        this.status = status;
        this.matchScore = matchScore;
        this.coverLetterId = coverLetterId;
    }
}
exports.Application = Application;
//# sourceMappingURL=application.entity.js.map