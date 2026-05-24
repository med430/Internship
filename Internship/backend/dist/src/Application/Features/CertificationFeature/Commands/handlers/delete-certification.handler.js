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
exports.DeleteCertificationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_certification_command_1 = require("../delete-certification.command");
const certification_repository_1 = require("../../../../repositories/certification.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
let DeleteCertificationHandler = class DeleteCertificationHandler {
    repo;
    studentRepo;
    constructor(repo, studentRepo) {
        this.repo = repo;
        this.studentRepo = studentRepo;
    }
    async execute(cmd) {
        const profile = await this.studentRepo.findByUserId(cmd.userId);
        if (!profile)
            throw new common_1.NotFoundException();
        const cert = await this.repo.findById(cmd.id);
        if (!cert || cert.deletedAt)
            throw new common_1.NotFoundException();
        if (cert.studentProfileId !== profile.id) {
            throw new common_1.ForbiddenException();
        }
        cert.deletedAt = new Date();
        await this.repo.save(cert);
        return { message: 'Certification deleted' };
    }
};
exports.DeleteCertificationHandler = DeleteCertificationHandler;
exports.DeleteCertificationHandler = DeleteCertificationHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_certification_command_1.DeleteCertificationCommand),
    __param(0, (0, common_1.Inject)(certification_repository_1.ICertificationRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], DeleteCertificationHandler);
//# sourceMappingURL=delete-certification.handler.js.map