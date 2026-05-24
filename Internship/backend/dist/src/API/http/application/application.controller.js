"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const apply_offer_command_1 = require("../../../Application/Features/ApplicationFeature/Commands/apply-offer.command");
const update_application_status_command_1 = require("../../../Application/Features/ApplicationFeature/Commands/update-application-status.command");
const withdraw_application_command_1 = require("../../../Application/Features/ApplicationFeature/Commands/withdraw-application.command");
const download_file_command_1 = require("../../../Application/Features/ApplicationFeature/Commands/download-file.command");
const application_status_enum_1 = require("../../../Domain/enums/application-status.enum");
let ApplicationController = class ApplicationController {
    commandBus;
    constructor(commandBus) {
        this.commandBus = commandBus;
    }
    apply(dto, user) {
        return this.commandBus.execute(new apply_offer_command_1.ApplyToOfferCommand(user.id, dto.offerId, dto.cvId, dto.coverLetterId));
    }
    accept(id, user) {
        return this.commandBus.execute(new update_application_status_command_1.UpdateApplicationStatusCommand(id, user.id, application_status_enum_1.ApplicationStatus.ACCEPTED));
    }
    reject(id, user) {
        return this.commandBus.execute(new update_application_status_command_1.UpdateApplicationStatusCommand(id, user.id, application_status_enum_1.ApplicationStatus.REJECTED));
    }
    async downloadCV(id, user, res) {
        const filePath = await this.commandBus.execute(new download_file_command_1.DownloadApplicationFileCommand(id, user.id, 'cv'));
        return res.download(filePath);
    }
    async downloadCoverLetter(id, user, res) {
        const filePath = await this.commandBus.execute(new download_file_command_1.DownloadApplicationFileCommand(id, user.id, 'coverLetter'));
        return res.download(filePath);
    }
    withdraw(id, user) {
        return this.commandBus.execute(new withdraw_application_command_1.WithdrawApplicationCommand(id, user.id));
    }
};
exports.ApplicationController = ApplicationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApplicationController.prototype, "apply", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)(':id/cv'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "downloadCV", null);
__decorate([
    (0, common_1.Get)(':id/cover-letter'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "downloadCoverLetter", null);
__decorate([
    (0, common_1.Patch)(':id/withdraw'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationController.prototype, "withdraw", null);
exports.ApplicationController = ApplicationController = __decorate([
    (0, common_1.Controller)('applications'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], ApplicationController);
//# sourceMappingURL=application.controller.js.map