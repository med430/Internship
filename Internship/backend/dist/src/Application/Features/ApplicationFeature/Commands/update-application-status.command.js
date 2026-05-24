"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateApplicationStatusCommand = void 0;
class UpdateApplicationStatusCommand {
    applicationId;
    userId;
    status;
    constructor(applicationId, userId, status) {
        this.applicationId = applicationId;
        this.userId = userId;
        this.status = status;
    }
}
exports.UpdateApplicationStatusCommand = UpdateApplicationStatusCommand;
//# sourceMappingURL=update-application-status.command.js.map