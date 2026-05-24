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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const update_student_profile_command_1 = require("../../../Application/Features/ProfileFeature/Commands/update-student-profile.command");
const update_recruiter_profile_command_1 = require("../../../Application/Features/ProfileFeature/Commands/update-recruiter-profile.command");
const soft_delete_user_command_1 = require("../../../Application/Features/ProfileFeature/Commands/soft-delete-user.command");
const role_enum_1 = require("../../../Domain/enums/role.enum");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let ProfileController = class ProfileController {
    commandBus;
    constructor(commandBus) {
        this.commandBus = commandBus;
    }
    update(req, dto) {
        const userId = req.user.id;
        const role = req.user.role;
        if (role === role_enum_1.Role.STUDENT) {
            const studentDto = dto;
            return this.commandBus.execute(new update_student_profile_command_1.UpdateStudentProfileCommand(userId, studentDto.name, studentDto.lastname, studentDto.username, studentDto.phone, studentDto.avatarUrl, studentDto.bio, studentDto.birthDate, studentDto.gender, studentDto.address, studentDto.city));
        }
        const recruiterDto = dto;
        return this.commandBus.execute(new update_recruiter_profile_command_1.UpdateRecruiterProfileCommand(userId, recruiterDto.name, recruiterDto.lastname, recruiterDto.username, recruiterDto.phone, recruiterDto.avatarUrl, recruiterDto.company, recruiterDto.companyDescription, recruiterDto.website));
    }
    softDelete(req) {
        return this.commandBus.execute(new soft_delete_user_command_1.SoftDeleteUserCommand(req.user.id));
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "softDelete", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map