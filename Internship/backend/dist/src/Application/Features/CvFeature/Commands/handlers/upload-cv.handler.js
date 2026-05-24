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
exports.UploadCVHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const upload_cv_command_1 = require("../upload-cv.command");
const cv_repository_1 = require("../../../../repositories/cv.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const FileStorageService_1 = require("../../../../Services/FileStorageService/FileStorageService");
const cv_entity_1 = require("../../../../../Domain/entities/cv.entity");
let UploadCVHandler = class UploadCVHandler {
    cvRepo;
    studentRepo;
    fileService;
    constructor(cvRepo, studentRepo, fileService) {
        this.cvRepo = cvRepo;
        this.studentRepo = studentRepo;
        this.fileService = fileService;
    }
    async execute(command) {
        const profile = await this.studentRepo.findByUserId(command.userId);
        if (!profile)
            throw new common_1.NotFoundException();
        const fileUrl = await this.fileService.upload(command.file, 'cvs');
        const cv = new cv_entity_1.CV((0, crypto_1.randomUUID)(), profile.id, fileUrl);
        return this.cvRepo.save(cv);
    }
};
exports.UploadCVHandler = UploadCVHandler;
exports.UploadCVHandler = UploadCVHandler = __decorate([
    (0, cqrs_1.CommandHandler)(upload_cv_command_1.UploadCVCommand),
    __param(0, (0, common_1.Inject)(cv_repository_1.ICVRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __param(2, (0, common_1.Inject)(FileStorageService_1.FileStorageService)),
    __metadata("design:paramtypes", [Object, Object, FileStorageService_1.FileStorageService])
], UploadCVHandler);
//# sourceMappingURL=upload-cv.handler.js.map