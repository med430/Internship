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
exports.DeleteCoverLetterHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_cover_letter_command_1 = require("../delete-cover-letter.command");
const coverletter_repository_1 = require("../../../../repositories/coverletter.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const application_repository_1 = require("../../../../repositories/application.repository");
const FileStorageService_1 = require("../../../../Services/FileStorageService/FileStorageService");
let DeleteCoverLetterHandler = class DeleteCoverLetterHandler {
    letterRepo;
    studentRepo;
    appRepo;
    fileService;
    constructor(letterRepo, studentRepo, appRepo, fileService) {
        this.letterRepo = letterRepo;
        this.studentRepo = studentRepo;
        this.appRepo = appRepo;
        this.fileService = fileService;
    }
    async execute(command) {
        const profile = await this.studentRepo.findByUserId(command.userId);
        if (!profile)
            throw new common_1.NotFoundException();
        const letter = await this.letterRepo.findById(command.letterId);
        if (!letter || letter.deletedAt)
            throw new common_1.NotFoundException();
        if (letter.studentId !== profile.id) {
            throw new common_1.ForbiddenException();
        }
        const isUsed = await this.appRepo.existsByCoverLetterId(letter.id);
        if (isUsed) {
            throw new common_1.BadRequestException('Letter is used in applications');
        }
        await this.fileService.delete(letter.fileUrl);
        letter.deletedAt = new Date();
        return this.letterRepo.save(letter);
    }
};
exports.DeleteCoverLetterHandler = DeleteCoverLetterHandler;
exports.DeleteCoverLetterHandler = DeleteCoverLetterHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_cover_letter_command_1.DeleteCoverLetterCommand),
    __param(0, (0, common_1.Inject)(coverletter_repository_1.ICoverLetterRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __param(2, (0, common_1.Inject)(application_repository_1.IApplicationRepository)),
    __param(3, (0, common_1.Inject)(FileStorageService_1.FileStorageService)),
    __metadata("design:paramtypes", [Object, Object, Object, FileStorageService_1.FileStorageService])
], DeleteCoverLetterHandler);
//# sourceMappingURL=delete-cover-letter.handler.js.map