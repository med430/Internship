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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOfferDTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const offer_type_enum_1 = require("../../../../Domain/enums/offer-type.enum");
const workMode_1 = require("../../../../Domain/enums/workMode");
const skill_level_enum_1 = require("../../../../Domain/enums/skill-level.enum");
class SkillRequirementDTO {
    skillId;
    level;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], SkillRequirementDTO.prototype, "skillId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(skill_level_enum_1.SkillLevel),
    __metadata("design:type", String)
], SkillRequirementDTO.prototype, "level", void 0);
class UpdateOfferDTO {
    title;
    description;
    company;
    location;
    domain;
    isPaid;
    workMode;
    startDate;
    endDate;
    type;
    requiredSkills;
}
exports.UpdateOfferDTO = UpdateOfferDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOfferDTO.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOfferDTO.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOfferDTO.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOfferDTO.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOfferDTO.prototype, "domain", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateOfferDTO.prototype, "isPaid", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(workMode_1.WorkMode),
    __metadata("design:type", Number)
], UpdateOfferDTO.prototype, "workMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateOfferDTO.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateOfferDTO.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(offer_type_enum_1.OfferType),
    __metadata("design:type", String)
], UpdateOfferDTO.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SkillRequirementDTO),
    __metadata("design:type", Array)
], UpdateOfferDTO.prototype, "requiredSkills", void 0);
//# sourceMappingURL=update-offer.dto.js.map