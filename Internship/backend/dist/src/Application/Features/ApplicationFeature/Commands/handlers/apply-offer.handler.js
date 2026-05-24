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
exports.ApplyToOfferHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const apply_offer_command_1 = require("../apply-offer.command");
const offer_repository_1 = require("../../../../repositories/offer.repository");
const application_repository_1 = require("../../../../repositories/application.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const application_entity_1 = require("../../../../../Domain/entities/application.entity");
const application_status_enum_1 = require("../../../../../Domain/enums/application-status.enum");
const coverletter_repository_1 = require("../../../../repositories/coverletter.repository");
const cv_repository_1 = require("../../../../repositories/cv.repository");
let ApplyToOfferHandler = class ApplyToOfferHandler {
    appRepo;
    offerRepo;
    studentRepo;
    cvRepo;
    letterRepo;
    constructor(appRepo, offerRepo, studentRepo, cvRepo, letterRepo) {
        this.appRepo = appRepo;
        this.offerRepo = offerRepo;
        this.studentRepo = studentRepo;
        this.cvRepo = cvRepo;
        this.letterRepo = letterRepo;
    }
    async execute(command) {
        const { userId, offerId, cvId, coverLetterId } = command;
        const offer = await this.offerRepo.findById(offerId);
        if (!offer || offer.deletedAt) {
            throw new common_1.NotFoundException('Offer not found');
        }
        const profile = await this.studentRepo.findByUserId(userId);
        if (!profile) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        if (!cvId) {
            throw new common_1.BadRequestException('CV is required');
        }
        const cv = await this.cvRepo.findById(cvId);
        if (!cv || cv.deletedAt || cv.studentId !== profile.id) {
            throw new common_1.BadRequestException('Invalid CV');
        }
        if (coverLetterId) {
            const letter = await this.letterRepo.findById(coverLetterId);
            if (!letter || letter.deletedAt || letter.studentId !== profile.id) {
                throw new common_1.BadRequestException('Invalid cover letter');
            }
        }
        const existing = await this.appRepo.findByStudentAndOffer(profile.id, offerId);
        if (existing && existing.status !== application_status_enum_1.ApplicationStatus.WITHDRAWN) {
            throw new common_1.BadRequestException('Already applied');
        }
        const application = new application_entity_1.Application((0, crypto_1.randomUUID)(), profile.id, offerId, cvId, application_status_enum_1.ApplicationStatus.SUBMITTED, 0, coverLetterId);
        return this.appRepo.save(application);
    }
};
exports.ApplyToOfferHandler = ApplyToOfferHandler;
exports.ApplyToOfferHandler = ApplyToOfferHandler = __decorate([
    (0, cqrs_1.CommandHandler)(apply_offer_command_1.ApplyToOfferCommand),
    __param(0, (0, common_1.Inject)(application_repository_1.IApplicationRepository)),
    __param(1, (0, common_1.Inject)(offer_repository_1.IOfferRepository)),
    __param(2, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __param(3, (0, common_1.Inject)(cv_repository_1.ICVRepository)),
    __param(4, (0, common_1.Inject)(coverletter_repository_1.ICoverLetterRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ApplyToOfferHandler);
//# sourceMappingURL=apply-offer.handler.js.map