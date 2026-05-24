"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEducationCommand = void 0;
class CreateEducationCommand {
    userId;
    school;
    degree;
    field;
    startDate;
    endDate;
    description;
    constructor(userId, school, degree, field, startDate, endDate, description) {
        this.userId = userId;
        this.school = school;
        this.degree = degree;
        this.field = field;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }
}
exports.CreateEducationCommand = CreateEducationCommand;
//# sourceMappingURL=create-education.command.js.map