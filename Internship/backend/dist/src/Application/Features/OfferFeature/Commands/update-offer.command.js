"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOfferCommand = void 0;
class UpdateOfferCommand {
    offerId;
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
    constructor(offerId, userId, title, description, company, location, domain, isPaid, workMode, startDate, endDate, type, requiredSkills) {
        this.offerId = offerId;
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
exports.UpdateOfferCommand = UpdateOfferCommand;
//# sourceMappingURL=update-offer.command.js.map