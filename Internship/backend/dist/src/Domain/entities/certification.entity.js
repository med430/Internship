"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certification = void 0;
const base_entity_1 = require("./base.entity");
class Certification extends base_entity_1.BaseEntity {
    id;
    studentProfileId;
    name;
    organization;
    issueDate;
    expirationDate;
    credentialId;
    credentialUrl;
    constructor(id, studentProfileId, name, organization, issueDate, expirationDate, credentialId, credentialUrl, createdAt, updatedAt, deletedAt) {
        super(createdAt, updatedAt, deletedAt);
        this.id = id;
        this.studentProfileId = studentProfileId;
        this.name = name;
        this.organization = organization;
        this.issueDate = issueDate;
        this.expirationDate = expirationDate;
        this.credentialId = credentialId;
        this.credentialUrl = credentialUrl;
    }
}
exports.Certification = Certification;
//# sourceMappingURL=certification.entity.js.map