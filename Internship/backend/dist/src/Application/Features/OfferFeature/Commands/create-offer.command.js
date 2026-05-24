"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOfferCommand = void 0;
class CreateOfferCommand {
    userId;
    title;
    description;
    company;
    location;
    domain;
    isPaid;
    workMode;
    startDate;
    endDate;
    type;
    requiredSkills;
    constructor(userId, title, description, company, location, domain, isPaid, workMode, startDate, endDate, type, requiredSkills) {
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.company = company;
        this.location = location;
        this.domain = domain;
        this.isPaid = isPaid;
        this.workMode = workMode;
        this.startDate = startDate;
        this.endDate = endDate;
        this.type = type;
        this.requiredSkills = requiredSkills;
    }
}
exports.CreateOfferCommand = CreateOfferCommand;
//# sourceMappingURL=create-offer.command.js.map