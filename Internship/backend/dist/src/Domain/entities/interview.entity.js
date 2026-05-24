"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interview = void 0;
class Interview {
    id;
    studentId;
    offerId;
    score;
    feedback;
    summary;
    constructor(id, studentId, offerId, score, feedback, summary) {
        this.id = id;
        this.studentId = studentId;
        this.offerId = offerId;
        this.score = score;
        this.feedback = feedback;
        this.summary = summary;
    }
}
exports.Interview = Interview;
//# sourceMappingURL=interview.entity.js.map