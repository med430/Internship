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
exports.UpdateCertificationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const generic_command_handler_1 = require("../../../GenericFeature/Commands/handlers/generic-command.handler");
const update_certification_command_1 = require("../update-certification.command");
const certification_repository_1 = require("../../../../repositories/certification.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
let UpdateCertificationHandler = class UpdateCertificationHandler extends generic_command_handler_1.GenericCommandHandler {
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
        const c = await this.repo.findById(cmd.id);
        if (!c)
            throw new common_1.NotFoundException('Certification not found');
        if (c.studentProfileId !== profile.id) {
            throw new common_1.ForbiddenException();
        }
        c.name = cmd.name ?? c.name;
        c.organization = cmd.organization ?? c.organization;
        c.issueDate = cmd.issueDate ?? c.issueDate;
        c.expirationDate = cmd.expirationDate ?? c.expirationDate;
        c.credentialId = cmd.credentialId ?? c.credentialId;
        c.credentialUrl = cmd.credentialUrl ?? c.credentialUrl;
        return c;
    }
    async persist(entity) {
        return this.repo.save(entity);
    }
};
exports.UpdateCertificationHandler = UpdateCertificationHandler;
exports.UpdateCertificationHandler = UpdateCertificationHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_certification_command_1.UpdateCertificationCommand),
    __param(0, (0, common_1.Inject)(certification_repository_1.ICertificationRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateCertificationHandler);
//# sourceMappingURL=update-certification.handler.js.map