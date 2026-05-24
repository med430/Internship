"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecruiterProfileMapper = void 0;
const common_1 = require("@nestjs/common");
const skill_requirement_1 = require("../../../../Domain/entities/skill-requirement");
const skill_entity_1 = require("../../../../Domain/entities/skill.entity");
const recruiter_profile_entity_1 = require("../../../../Domain/entities/recruiter-profile.entity");
const offer_entity_1 = require("../../../../Domain/entities/offer.entity");
let RecruiterProfileMapper = class RecruiterProfileMapper {
    toDomain(raw) {
        return new recruiter_profile_entity_1.RecruiterProfile(raw.id, raw.userId, raw.company, raw.companyDescription ?? undefined, raw.website ?? undefined, raw.offers.map(o => new offer_entity_1.Offer(o.id, o.recruiterProfileId, o.title, o.description, o.company, o.location, o.domain, o.isPaid, o.workMode, o.startDate, o.endDate, o.skillRequirements.map(sr => new skill_requirement_1.SkillRequirement(sr.id, new skill_entity_1.Skill(sr.skill.id, sr.skill.name), sr.level)), o.type, o.createdAt, o.updatedAt, o.deletedAt ?? undefined)));
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            userId: domain.userId,
            company: domain.company,
            companyDescription: domain.companyDescription ?? null,
            website: domain.website ?? null,
        };
    }
};
exports.RecruiterProfileMapper = RecruiterProfileMapper;
exports.RecruiterProfileMapper = RecruiterProfileMapper = __decorate([
    (0, common_1.Injectable)()
], RecruiterProfileMapper);
//# sourceMappingURL=recruiter-profile.mapper.js.map