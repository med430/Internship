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
exports.EducationController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const create_education_dto_1 = require("./dto/create-education.dto");
const update_education_dto_1 = require("./dto/update-education.dto");
const create_education_command_1 = require("../../../Application/Features/EducationFeature/Commands/create-education.command");
const update_education_command_1 = require("../../../Application/Features/EducationFeature/Commands/update-education.command");
const delete_education_command_1 = require("../../../Application/Features/EducationFeature/Commands/delete-education.command");
let EducationController = class EducationController {
    bus;
    constructor(bus) {
        this.bus = bus;
    }
    create(dto, user) {
        return this.bus.execute(new create_education_command_1.CreateEducationCommand(user.id, dto.school, dto.degree, dto.field, dto.startDate, dto.endDate, dto.description));
    }
    update(id, dto, user) {
        return this.bus.execute(new update_education_command_1.UpdateEducationCommand(user.id, id, dto.school, dto.degree, dto.field, dto.startDate, dto.endDate, dto.description));
    }
    delete(id, user) {
        return this.bus.execute(new delete_education_command_1.DeleteEducationCommand(user.id, id));
    }
};
exports.EducationController = EducationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_education_dto_1.CreateEducationDTO, Object]),
    __metadata("design:returntype", void 0)
], EducationController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_education_dto_1.UpdateEducationDTO, Object]),
    __metadata("design:returntype", void 0)
], EducationController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EducationController.prototype, "delete", null);
exports.EducationController = EducationController = __decorate([
    (0, common_1.Controller)('educations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], EducationController);
//# sourceMappingURL=education.controller.js.map