"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
const base_entity_1 = require("./base.entity");
class Offer extends base_entity_1.BaseEntity {
    id;
    recruiterProfileId;
    title;
    description;
    company;
    location;
    domain;
    isPaid;
    workMode;
    startDate;
    endDate;
    skillRequirements;
    type;
    constructor(id, recruiterProfileId, title, description, company, location, domain, isPaid, workMode, startDate, endDate, skillRequirements, type, createdAt, updatedAt, deletedAt) {
        super(createdAt, updatedAt, deletedAt);
        this.id = id;
        this.recruiterProfileId = recruiterProfileId;
        this.title = title;
        this.description = description;
        this.company = company;
        this.location = location;
        this.domain = domain;
        this.isPaid = isPaid;
        this.workMode = workMode;
        this.startDate = startDate;
        this.endDate = endDate;
        this.skillRequirements = skillRequirements;
        this.type = type;
    }
}
exports.Offer = Offer;
//# sourceMappingURL=offer.entity.js.map