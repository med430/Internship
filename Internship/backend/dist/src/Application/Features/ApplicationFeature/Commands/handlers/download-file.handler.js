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
exports.DownloadApplicationFileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const offer_repository_1 = require("../../../../repositories/offer.repository");
const recruiter_profile_repository_1 = require("../../../../repositories/recruiter-profile.repository");
const application_repository_1 = require("../../../../repositories/application.repository");
const download_file_command_1 = require("../download-file.command");
const FileStorageService_1 = require("../../../../Services/FileStorageService/FileStorageService");
const cv_repository_1 = require("../../../../repositories/cv.repository");
const coverletter_repository_1 = require("../../../../repositories/coverletter.repository");
let DownloadApplicationFileHandler = class DownloadApplicationFileHandler {
    appRepo;
    offerRepo;
    recruiterRepo;
    cvRepo;
    coverLetterRepo;
    fileService;
    constructor(appRepo, offerRepo, recruiterRepo, cvRepo, coverLetterRepo, fileService) {
        this.appRepo = appRepo;
        this.offerRepo = offerRepo;
        this.recruiterRepo = recruiterRepo;
        this.cvRepo = cvRepo;
        this.coverLetterRepo = coverLetterRepo;
        this.fileService = fileService;
    }
    async execute(command) {
        const { applicationId, userId, type } = command;
        const application = await this.appRepo.findById(applicationId);
        if (!application)
            throw new common_1.NotFoundException();
        const offer = await this.offerRepo.findById(application.offerId);
        if (!offer || offer.deletedAt)
            throw new common_1.NotFoundException();
        const recruiter = await this.recruiterRepo.findByUserId(userId);
        if (!recruiter)
            throw new common_1.ForbiddenException();
        if (offer.recruiterProfileId !== recruiter.id)
            throw new common_1.ForbiddenException();
        if (type === 'cv') {
            const cv = await this.cvRepo.findById(application.cvId);
            if (!cv || cv.deletedAt)
                throw new common_1.NotFoundException();
            return this.fileService.getFilePath(cv.fileUrl);
        }
        if (!application.coverLetterId)
            throw new common_1.NotFoundException('No cover letter');
        const letter = await this.coverLetterRepo.findById(application.coverLetterId);
        if (!letter || letter.deletedAt)
            throw new common_1.NotFoundException();
        return this.fileService.getFilePath(letter.fileUrl);
    }
};
exports.DownloadApplicationFileHandler = DownloadApplicationFileHandler;
exports.DownloadApplicationFileHandler = DownloadApplicationFileHandler = __decorate([
    (0, cqrs_1.CommandHandler)(download_file_command_1.DownloadApplicationFileCommand),
    __param(0, (0, common_1.Inject)(application_repository_1.IApplicationRepository)),
    __param(1, (0, common_1.Inject)(offer_repository_1.IOfferRepository)),
    __param(2, (0, common_1.Inject)(recruiter_profile_repository_1.IRecruiterProfileRepository)),
    __param(3, (0, common_1.Inject)(cv_repository_1.ICVRepository)),
    __param(4, (0, common_1.Inject)(coverletter_repository_1.ICoverLetterRepository)),
    __param(5, (0, common_1.Inject)(FileStorageService_1.FileStorageService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, FileStorageService_1.FileStorageService])
], DownloadApplicationFileHandler);
//# sourceMappingURL=download-file.handler.js.map