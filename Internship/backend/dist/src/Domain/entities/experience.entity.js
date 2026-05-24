"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Experience = void 0;
const base_entity_1 = require("./base.entity");
class Experience extends base_entity_1.BaseEntity {
    id;
    studentProfileId;
    company;
    role;
    startDate;
    endDate;
    description;
    constructor(id, studentProfileId, company, role, startDate, endDate, description, createdAt, updatedAt, deletedAt) {
        super(createdAt, updatedAt, deletedAt);
        this.id = id;
        this.studentProfileId = studentProfileId;
        this.company = company;
        this.role = role;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }
}
exports.Experience = Experience;
//# sourceMappingURL=experience.entity.js.map