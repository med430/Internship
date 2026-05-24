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
exports.CertificationController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const create_certification_dto_1 = require("./dto/create-certification.dto");
const create_certification_command_1 = require("../../../Application/Features/CertificationFeature/Commands/create-certification.command");
const update_certification_command_1 = require("../../../Application/Features/CertificationFeature/Commands/update-certification.command");
const delete_certification_command_1 = require("../../../Application/Features/CertificationFeature/Commands/delete-certification.command");
const update_certification_dto_1 = require("./dto/update-certification.dto");
let CertificationController = class CertificationController {
    bus;
    constructor(bus) {
        this.bus = bus;
    }
    create(dto, user) {
        return this.bus.execute(new create_certification_command_1.CreateCertificationCommand(user.id, dto.name, dto.organization, dto.issueDate, dto.expirationDate, dto.credentialId, dto.credentialUrl));
    }
    update(id, dto, user) {
        return this.bus.execute(new update_certification_command_1.UpdateCertificationCommand(user.id, id, dto.name, dto.organization, dto.issueDate, dto.expirationDate, dto.credentialId, dto.credentialUrl));
    }
    delete(id, user) {
        return this.bus.execute(new delete_certification_command_1.DeleteCertificationCommand(user.id, id));
    }
};
exports.CertificationController = CertificationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_certification_dto_1.CreateCertificationDTO, Object]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_certification_dto_1.UpdateCertificationDTO, Object]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "delete", null);
exports.CertificationController = CertificationController = __decorate([
    (0, common_1.Controller)('certifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], CertificationController);
//# sourceMappingURL=certification.controller.js.map