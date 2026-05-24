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
exports.UpdateOfferHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_offer_command_1 = require("../update-offer.command");
const offer_repository_1 = require("../../../../repositories/offer.repository");
const skill_repository_1 = require("../../../../repositories/skill.repository");
const recruiter_profile_repository_1 = require("../../../../repositories/recruiter-profile.repository");
const crypto_1 = require("crypto");
const skill_requirement_1 = require("../../../../../Domain/entities/skill-requirement");
let UpdateOfferHandler = class UpdateOfferHandler {
    offerRepo;
    skillRepo;
    recruiterRepo;
    constructor(offerRepo, skillRepo, recruiterRepo) {
        this.offerRepo = offerRepo;
        this.skillRepo = skillRepo;
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
        offer.title = cmd.title ?? offer.title;
        offer.description = cmd.description ?? offer.description;
        offer.company = cmd.company ?? offer.company;
        offer.location = cmd.location ?? offer.location;
        offer.domain = cmd.domain ?? offer.domain;
        offer.isPaid = cmd.isPaid ?? offer.isPaid;
        offer.workMode = cmd.workMode ?? offer.workMode;
        if (cmd.startDate)
            offer.startDate = cmd.startDate;
        if (cmd.endDate)
            offer.endDate = cmd.endDate;
        if (cmd.type)
            offer.type = cmd.type;
        if (offer.startDate >= offer.endDate) {
            throw new common_1.BadRequestException('Invalid date range');
        }
        if (cmd.requiredSkills) {
            const skills = await this.skillRepo.findByIds(cmd.requiredSkills.map(s => s.skillId));
            if (skills.length !== cmd.requiredSkills.length) {
                throw new common_1.BadRequestException('Invalid skills');
            }
            offer.skillRequirements = cmd.requiredSkills.map(req => {
                const skill = skills.find(s => s.id === req.skillId);
                return new skill_requirement_1.SkillRequirement((0, crypto_1.randomUUID)(), skill, req.level);
            });
        }
        offer.updatedAt = new Date();
        return this.offerRepo.save(offer);
    }
};
exports.UpdateOfferHandler = UpdateOfferHandler;
exports.UpdateOfferHandler = UpdateOfferHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_offer_command_1.UpdateOfferCommand),
    __param(0, (0, common_1.Inject)(offer_repository_1.IOfferRepository)),
    __param(1, (0, common_1.Inject)(skill_repository_1.ISkillRepository)),
    __param(2, (0, common_1.Inject)(recruiter_profile_repository_1.IRecruiterProfileRepository)),
    __metadata("design:paramtypes", [Object, skill_repository_1.ISkillRepository, Object])
], UpdateOfferHandler);
//# sourceMappingURL=update-offer.handler.js.map