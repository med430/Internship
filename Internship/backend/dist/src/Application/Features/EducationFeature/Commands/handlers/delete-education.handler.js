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
exports.DeleteEducationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_education_command_1 = require("../delete-education.command");
const education_repository_1 = require("../../../../repositories/education.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
let DeleteEducationHandler = class DeleteEducationHandler {
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
        const edu = await this.repo.findById(cmd.id);
        if (!edu || edu.deletedAt)
            throw new common_1.NotFoundException();
        if (edu.studentProfileId !== profile.id) {
            throw new common_1.ForbiddenException();
        }
        edu.deletedAt = new Date();
        await this.repo.save(edu);
        return { message: 'Education deleted' };
    }
};
exports.DeleteEducationHandler = DeleteEducationHandler;
exports.DeleteEducationHandler = DeleteEducationHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_education_command_1.DeleteEducationCommand),
    __param(0, (0, common_1.Inject)(education_repository_1.IEducationRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], DeleteEducationHandler);
//# sourceMappingURL=delete-education.handler.js.map