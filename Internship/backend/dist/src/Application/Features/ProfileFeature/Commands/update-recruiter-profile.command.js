"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRecruiterProfileCommand = void 0;
class UpdateRecruiterProfileCommand {
    userId;
    name;
    lastname;
    username;
    phone;
    avatarUrl;
    company;
    companyDescription;
    website;
    constructor(userId, name, lastname, username, phone, avatarUrl, company, companyDescription, website) {
        this.userId = userId;
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
        this.company = company;
        this.companyDescription = companyDescription;
        this.website = website;
    }
}
exports.UpdateRecruiterProfileCommand = UpdateRecruiterProfileCommand;
//# sourceMappingURL=update-recruiter-profile.command.js.map