"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateExperienceCommand = void 0;
class CreateExperienceCommand {
    userId;
    company;
    role;
    startDate;
    endDate;
    description;
    constructor(userId, company, role, startDate, endDate, description) {
        this.userId = userId;
        this.company = company;
        this.role = role;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }
}
exports.CreateExperienceCommand = CreateExperienceCommand;
//# sourceMappingURL=create-experience.command.js.map