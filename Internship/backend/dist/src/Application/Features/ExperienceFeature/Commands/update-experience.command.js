"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExperienceCommand = void 0;
class UpdateExperienceCommand {
    userId;
    id;
    company;
    role;
    startDate;
    endDate;
    description;
    constructor(userId, id, company, role, startDate, endDate, description) {
        this.userId = userId;
        this.id = id;
        this.company = company;
        this.role = role;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }
}
exports.UpdateExperienceCommand = UpdateExperienceCommand;
//# sourceMappingURL=update-experience.command.js.map