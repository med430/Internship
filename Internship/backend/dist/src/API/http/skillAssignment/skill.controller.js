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
exports.SkillAssignmentController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const assign_skill_dto_1 = require("./dto/assign-skill.dto");
const update_skill_command_1 = require("../../../Application/Features/SkillAssignmentFeature/Commands/update-skill.command");
const assign_skill_command_1 = require("../../../Application/Features/SkillAssignmentFeature/Commands/assign-skill.command");
const update_skill_dto_1 = require("./dto/update-skill.dto");
const remove_skill_command_1 = require("../../../Application/Features/SkillAssignmentFeature/Commands/remove-skill.command");
let SkillAssignmentController = class SkillAssignmentController {
    commandBus;
    constructor(commandBus) {
        this.commandBus = commandBus;
    }
    assign(dto, user) {
        return this.commandBus.execute(new assign_skill_command_1.AssignSkillCommand(user.id, dto.skillId, dto.level));
    }
    update(id, dto, user) {
        return this.commandBus.execute(new update_skill_command_1.UpdateSkillCommand(user.id, id, dto.level));
    }
    remove(id, user) {
        return this.commandBus.execute(new remove_skill_command_1.RemoveSkillCommand(user.id, id));
    }
};
exports.SkillAssignmentController = SkillAssignmentController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_skill_dto_1.AssignSkillDTO, Object]),
    __metadata("design:returntype", void 0)
], SkillAssignmentController.prototype, "assign", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_skill_dto_1.UpdateSkillDTO, Object]),
    __metadata("design:returntype", void 0)
], SkillAssignmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SkillAssignmentController.prototype, "remove", null);
exports.SkillAssignmentController = SkillAssignmentController = __decorate([
    (0, common_1.Controller)('skill-assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], SkillAssignmentController);
//# sourceMappingURL=skill.controller.js.map