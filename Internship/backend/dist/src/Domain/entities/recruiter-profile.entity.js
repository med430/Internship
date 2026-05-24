"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecruiterProfile = void 0;
class RecruiterProfile {
    id;
    userId;
    company;
    companyDescription;
    website;
    offers;
    constructor(id, userId, company, companyDescription, website, offers = []) {
        this.id = id;
        this.userId = userId;
        this.company = company;
        this.companyDescription = companyDescription;
        this.website = website;
        this.offers = offers;
    }
}
exports.RecruiterProfile = RecruiterProfile;
//# sourceMappingURL=recruiter-profile.entity.js.map