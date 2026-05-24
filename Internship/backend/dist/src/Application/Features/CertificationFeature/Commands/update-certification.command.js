"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCertificationCommand = void 0;
class UpdateCertificationCommand {
    userId;
    id;
    name;
    organization;
    issueDate;
    expirationDate;
    credentialId;
    credentialUrl;
    constructor(userId, id, name, organization, issueDate, expirationDate, credentialId, credentialUrl) {
        this.userId = userId;
        this.id = id;
        this.name = name;
        this.organization = organization;
        this.issueDate = issueDate;
        this.expirationDate = expirationDate;
        this.credentialId = credentialId;
        this.credentialUrl = credentialUrl;
    }
}
exports.UpdateCertificationCommand = UpdateCertificationCommand;
//# sourceMappingURL=update-certification.command.js.map