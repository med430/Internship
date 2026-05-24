"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Education = void 0;
const base_entity_1 = require("./base.entity");
class Education extends base_entity_1.BaseEntity {
    id;
    studentProfileId;
    school;
    degree;
    field;
    startDate;
    endDate;
    description;
    constructor(id, studentProfileId, school, degree, field, startDate, endDate, description, createdAt, updatedAt, deletedAt) {
        super(createdAt, updatedAt, deletedAt);
        this.id = id;
        this.studentProfileId = studentProfileId;
        this.school = school;
        this.degree = degree;
        this.field = field;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }
}
exports.Education = Education;
//# sourceMappingURL=education.entity.js.map