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
exports.DeleteOfferHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_offer_command_1 = require("../delete-offer.command");
const offer_repository_1 = require("../../../../repositories/offer.repository");
const recruiter_profile_repository_1 = require("../../../../repositories/recruiter-profile.repository");
let DeleteOfferHandler = class DeleteOfferHandler {
    offerRepo;
    recruiterRepo;
    constructor(offerRepo, recruiterRepo) {
        this.offerRepo = offerRepo;
        this.recruiterRepo = recruiterRepo;
    }
    async execute(cmd) {
        const offer = await this.offerRepo.findById(cmd.offerId);
        if (!offer || offer.deletedAt)
            throw new common_1.NotFoundException();
        const recruiter = await this.recruiterRepo.findByUserId(cmd.userId);
        if (!recruiter)
            throw new common_1.ForbiddenException();
        if (offer.recruiterProfileId !== recruiter.id) {
            throw new common_1.ForbiddenException();
        }
        offer.deletedAt = new Date();
        offer.updatedAt = new Date();
        return this.offerRepo.save(offer);
    }
};
exports.DeleteOfferHandler = DeleteOfferHandler;
exports.DeleteOfferHandler = DeleteOfferHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_offer_command_1.DeleteOfferCommand),
    __param(0, (0, common_1.Inject)(offer_repository_1.IOfferRepository)),
    __param(1, (0, common_1.Inject)(recruiter_profile_repository_1.IRecruiterProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], DeleteOfferHandler);
//# sourceMappingURL=delete-offer.handler.js.map