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
exports.UpdateExperienceHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const generic_command_handler_1 = require("../../../GenericFeature/Commands/handlers/generic-command.handler");
const experience_repository_1 = require("../../../../repositories/experience.repository");
const update_experience_command_1 = require("../update-experience.command");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
let UpdateExperienceHandler = class UpdateExperienceHandler extends generic_command_handler_1.GenericCommandHandler {
    repo;
    studentRepo;
    constructor(repo, studentRepo) {
        super();
        this.repo = repo;
        this.studentRepo = studentRepo;
    }
    async map(cmd) {
        const profile = await this.studentRepo.findByUserId(cmd.userId);
        if (!profile)
            throw new common_1.NotFoundException('Student profile not found');
        const e = await this.repo.findById(cmd.id);
        if (!e)
            throw new common_1.NotFoundException('Experience not found');
        if (e.studentProfileId !== profile.id) {
            throw new common_1.ForbiddenException();
        }
        e.company = cmd.company ?? e.company;
        e.role = cmd.role ?? e.role;
        e.startDate = cmd.startDate ?? e.startDate;
        e.endDate = cmd.endDate ?? e.endDate;
        e.description = cmd.description ?? e.description;
        return e;
    }
    async persist(entity) {
        return this.repo.save(entity);
    }
};
exports.UpdateExperienceHandler = UpdateExperienceHandler;
exports.UpdateExperienceHandler = UpdateExperienceHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_experience_command_1.UpdateExperienceCommand),
    __param(0, (0, common_1.Inject)(experience_repository_1.IExperienceRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateExperienceHandler);
//# sourceMappingURL=update-experience.handler.js.map