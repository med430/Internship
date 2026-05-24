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
exports.AssignSkillHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const assign_skill_command_1 = require("../assign-skill.command");
const common_1 = require("@nestjs/common");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const skill_assignment_repository_1 = require("../../../../repositories/skill-assignment.repository");
const crypto_1 = require("crypto");
const skill_repository_1 = require("../../../../repositories/skill.repository");
const skill_assignment_entity_1 = require("../../../../../Domain/entities/skill-assignment.entity");
let AssignSkillHandler = class AssignSkillHandler {
    studentRepo;
    skillRepo;
    skillRepository;
    constructor(studentRepo, skillRepo, skillRepository) {
        this.studentRepo = studentRepo;
        this.skillRepo = skillRepo;
        this.skillRepository = skillRepository;
    }
    async execute(command) {
        const profile = await this.studentRepo.findByUserId(command.userId);
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const skill = await this.skillRepository.findById(command.skillId);
        if (!skill)
            throw new common_1.NotFoundException('Skill not found');
        const exists = await this.skillRepo.findByStudentAndSkill(profile.id, command.skillId);
        if (exists) {
            throw new common_1.BadRequestException('Skill already assigned');
        }
        return this.skillRepo.save(new skill_assignment_entity_1.SkillAssignment((0, crypto_1.randomUUID)(), command.skillId, profile.id, command.level));
    }
};
exports.AssignSkillHandler = AssignSkillHandler;
exports.AssignSkillHandler = AssignSkillHandler = __decorate([
    (0, cqrs_1.CommandHandler)(assign_skill_command_1.AssignSkillCommand),
    __param(0, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __param(1, (0, common_1.Inject)(skill_assignment_repository_1.ISkillAssignmentRepository)),
    __param(2, (0, common_1.Inject)(skill_repository_1.ISkillRepository)),
    __metadata("design:paramtypes", [Object, Object, skill_repository_1.ISkillRepository])
], AssignSkillHandler);
//# sourceMappingURL=assign-skill.handler.js.map