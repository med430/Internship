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
exports.UpdateSkillHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const skill_assignment_repository_1 = require("../../../../repositories/skill-assignment.repository");
const update_skill_command_1 = require("../update-skill.command");
let UpdateSkillHandler = class UpdateSkillHandler {
    skillRepo;
    studentRepo;
    constructor(skillRepo, studentRepo) {
        this.skillRepo = skillRepo;
        this.studentRepo = studentRepo;
    }
    async execute(command) {
        const profile = await this.studentRepo.findByUserId(command.userId);
        if (!profile)
            throw new common_1.NotFoundException();
        const skill = await this.skillRepo.findById(command.assignmentId);
        if (!skill)
            throw new common_1.NotFoundException();
        if (skill.studentProfileId !== profile.id) {
            throw new common_1.ForbiddenException();
        }
        return this.skillRepo.updateLevel(command.assignmentId, command.level);
    }
};
exports.UpdateSkillHandler = UpdateSkillHandler;
exports.UpdateSkillHandler = UpdateSkillHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_skill_command_1.UpdateSkillCommand),
    __param(0, (0, common_1.Inject)(skill_assignment_repository_1.ISkillAssignmentRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateSkillHandler);
//# sourceMappingURL=update-skill.handler.js.map