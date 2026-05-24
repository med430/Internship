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
exports.UploadCoverLetterHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const upload_cover_letter_command_1 = require("../upload-cover-letter.command");
const coverletter_repository_1 = require("../../../../repositories/coverletter.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const coverletter_entity_1 = require("../../../../../Domain/entities/coverletter.entity");
const crypto_1 = require("crypto");
const FileStorageService_1 = require("../../../../Services/FileStorageService/FileStorageService");
let UploadCoverLetterHandler = class UploadCoverLetterHandler {
    letterRepo;
    studentRepo;
    fileService;
    constructor(letterRepo, studentRepo, fileService) {
        this.letterRepo = letterRepo;
        this.studentRepo = studentRepo;
        this.fileService = fileService;
    }
    async execute(command) {
        const profile = await this.studentRepo.findByUserId(command.userId);
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const fileUrl = await this.fileService.upload(command.file, 'letters');
        const letter = new coverletter_entity_1.CoverLetter((0, crypto_1.randomUUID)(), profile.id, fileUrl);
        return this.letterRepo.save(letter);
    }
};
exports.UploadCoverLetterHandler = UploadCoverLetterHandler;
exports.UploadCoverLetterHandler = UploadCoverLetterHandler = __decorate([
    (0, cqrs_1.CommandHandler)(upload_cover_letter_command_1.UploadCoverLetterCommand),
    __param(0, (0, common_1.Inject)(coverletter_repository_1.ICoverLetterRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __param(2, (0, common_1.Inject)(FileStorageService_1.FileStorageService)),
    __metadata("design:paramtypes", [Object, Object, FileStorageService_1.FileStorageService])
], UploadCoverLetterHandler);
//# sourceMappingURL=upload-cover-letter.handler.js.map