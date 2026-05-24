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
exports.UpdateEducationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const generic_command_handler_1 = require("../../../GenericFeature/Commands/handlers/generic-command.handler");
const update_education_command_1 = require("../update-education.command");
const education_repository_1 = require("../../../../repositories/education.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
let UpdateEducationHandler = class UpdateEducationHandler extends generic_command_handler_1.GenericCommandHandler {
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
            throw new common_1.NotFoundException('Education not found');
        if (e.studentProfileId !== profile.id) {
            throw new common_1.ForbiddenException();
        }
        e.school = cmd.school ?? e.school;
        e.degree = cmd.degree ?? e.degree;
        e.field = cmd.field ?? e.field;
        e.startDate = cmd.startDate ?? e.startDate;
        e.endDate = cmd.endDate ?? e.endDate;
        e.description = cmd.description ?? e.description;
        return e;
    }
    async persist(entity) {
        return this.repo.save(entity);
    }
};
exports.UpdateEducationHandler = UpdateEducationHandler;
exports.UpdateEducationHandler = UpdateEducationHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_education_command_1.UpdateEducationCommand),
    __param(0, (0, common_1.Inject)(education_repository_1.IEducationRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateEducationHandler);
//# sourceMappingURL=update-education.handler.js.map