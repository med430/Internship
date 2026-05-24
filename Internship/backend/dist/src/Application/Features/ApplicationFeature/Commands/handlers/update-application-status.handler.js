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
exports.UpdateApplicationStatusHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_application_status_command_1 = require("../update-application-status.command");
const offer_repository_1 = require("../../../../repositories/offer.repository");
const recruiter_profile_repository_1 = require("../../../../repositories/recruiter-profile.repository");
const application_status_enum_1 = require("../../../../../Domain/enums/application-status.enum");
const application_repository_1 = require("../../../../repositories/application.repository");
let UpdateApplicationStatusHandler = class UpdateApplicationStatusHandler {
    appRepo;
    offerRepo;
    recruiterRepo;
    constructor(appRepo, offerRepo, recruiterRepo) {
        this.appRepo = appRepo;
        this.offerRepo = offerRepo;
        this.recruiterRepo = recruiterRepo;
    }
    async execute(command) {
        const { applicationId, userId, status } = command;
        const application = await this.appRepo.findById(applicationId);
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        const offer = await this.offerRepo.findById(application.offerId);
        if (!offer || offer.deletedAt) {
            throw new common_1.NotFoundException('Offer not found');
        }
        const recruiter = await this.recruiterRepo.findByUserId(userId);
        if (!recruiter) {
            throw new common_1.NotFoundException('Recruiter profile not found');
        }
        if (offer.recruiterProfileId !== recruiter.id) {
            throw new common_1.ForbiddenException('Not allowed');
        }
        if (application.status === application_status_enum_1.ApplicationStatus.ACCEPTED ||
            application.status === application_status_enum_1.ApplicationStatus.REJECTED) {
            throw new common_1.BadRequestException('Application already finalized');
        }
        if (status !== application_status_enum_1.ApplicationStatus.ACCEPTED &&
            status !== application_status_enum_1.ApplicationStatus.REJECTED) {
            throw new common_1.BadRequestException('Invalid status transition');
        }
        application.status = status;
        if (status === application_status_enum_1.ApplicationStatus.ACCEPTED) {
            await this.appRepo.rejectAllExcept(application.offerId, application.id);
        }
        return this.appRepo.save(application);
    }
};
exports.UpdateApplicationStatusHandler = UpdateApplicationStatusHandler;
exports.UpdateApplicationStatusHandler = UpdateApplicationStatusHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_application_status_command_1.UpdateApplicationStatusCommand),
    __param(0, (0, common_1.Inject)(application_repository_1.IApplicationRepository)),
    __param(1, (0, common_1.Inject)(offer_repository_1.IOfferRepository)),
    __param(2, (0, common_1.Inject)(recruiter_profile_repository_1.IRecruiterProfileRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], UpdateApplicationStatusHandler);
//# sourceMappingURL=update-application-status.handler.js.map