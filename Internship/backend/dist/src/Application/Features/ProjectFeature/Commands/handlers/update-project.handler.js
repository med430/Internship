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
exports.UpdateProjectHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const generic_command_handler_1 = require("../../../GenericFeature/Commands/handlers/generic-command.handler");
const update_project_command_1 = require("../update-project.command");
const project_repository_1 = require("../../../../repositories/project.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
let UpdateProjectHandler = class UpdateProjectHandler extends generic_command_handler_1.GenericCommandHandler {
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
        const p = await this.repo.findById(cmd.id);
        if (!p)
            throw new common_1.NotFoundException('Project not found');
        if (p.studentProfileId !== profile.id) {
            throw new common_1.ForbiddenException();
        }
        p.title = cmd.title ?? p.title;
        p.description = cmd.description ?? p.description;
        p.technologies = cmd.technologies ?? p.technologies;
        p.githubUrl = cmd.githubUrl ?? p.githubUrl;
        p.demoUrl = cmd.demoUrl ?? p.demoUrl;
        return p;
    }
    async persist(entity) {
        return this.repo.save(entity);
    }
};
exports.UpdateProjectHandler = UpdateProjectHandler;
exports.UpdateProjectHandler = UpdateProjectHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_project_command_1.UpdateProjectCommand),
    __param(0, (0, common_1.Inject)(project_repository_1.IProjectRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateProjectHandler);
//# sourceMappingURL=update-project.handler.js.map