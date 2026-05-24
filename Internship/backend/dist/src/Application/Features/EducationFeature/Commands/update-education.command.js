"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEducationCommand = void 0;
class UpdateEducationCommand {
    userId;
    id;
    school;
    degree;
    field;
    startDate;
    endDate;
    description;
    constructor(userId, id, school, degree, field, startDate, endDate, description) {
        this.userId = userId;
        this.id = id;
        this.school = school;
        this.degree = degree;
        this.field = field;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }
}
exports.UpdateEducationCommand = UpdateEducationCommand;
//# sourceMappingURL=update-education.command.js.map