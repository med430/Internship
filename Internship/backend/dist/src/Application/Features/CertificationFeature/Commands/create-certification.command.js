"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCertificationCommand = void 0;
class CreateCertificationCommand {
    userId;
    name;
    organization;
    issueDate;
    expirationDate;
    credentialId;
    credentialUrl;
    constructor(userId, name, organization, issueDate, expirationDate, credentialId, credentialUrl) {
        this.userId = userId;
        this.name = name;
        this.organization = organization;
        this.issueDate = issueDate;
        this.expirationDate = expirationDate;
        this.credentialId = credentialId;
        this.credentialUrl = credentialUrl;
    }
}
exports.CreateCertificationCommand = CreateCertificationCommand;
//# sourceMappingURL=create-certification.command.js.map