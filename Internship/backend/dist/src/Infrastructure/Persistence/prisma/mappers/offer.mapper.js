"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferMapper = void 0;
const common_1 = require("@nestjs/common");
const offer_entity_1 = require("../../../../Domain/entities/offer.entity");
const skill_requirement_1 = require("../../../../Domain/entities/skill-requirement");
const skill_entity_1 = require("../../../../Domain/entities/skill.entity");
let OfferMapper = class OfferMapper {
    toDomain(raw) {
        return new offer_entity_1.Offer(raw.id, raw.recruiterProfileId, raw.title, raw.description, raw.company, raw.location, raw.domain, raw.isPaid, raw.workMode, raw.startDate, raw.endDate, raw.skillRequirements.map(sr => new skill_requirement_1.SkillRequirement(sr.id, new skill_entity_1.Skill(sr.skill.id, sr.skill.name), sr.level)), raw.type, raw.createdAt, raw.updatedAt, raw.deletedAt ?? undefined);
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            recruiterProfileId: domain.recruiterProfileId,
            title: domain.title,
            description: domain.description,
            company: domain.company,
            location: domain.location,
            domain: domain.domain,
            isPaid: domain.isPaid,
            workMode: domain.workMode,
            startDate: domain.startDate,
            endDate: domain.endDate,
            type: domain.type,
            deletedAt: domain.deletedAt ?? null,
            skillRequirements: {
                create: domain.skillRequirements.map(sr => ({
                    id: sr.id,
                    skillId: sr.skill.id,
                    level: sr.level,
                }))
            }
        };
    }
};
exports.OfferMapper = OfferMapper;
exports.OfferMapper = OfferMapper = __decorate([
    (0, common_1.Injectable)()
], OfferMapper);
//# sourceMappingURL=offer.mapper.js.map