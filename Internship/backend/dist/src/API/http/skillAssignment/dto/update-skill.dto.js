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
exports.UpdateSkillDTO = void 0;
const class_validator_1 = require("class-validator");
const skill_level_enum_1 = require("../../../../Domain/enums/skill-level.enum");
class UpdateSkillDTO {
    level;
}
exports.UpdateSkillDTO = UpdateSkillDTO;
__decorate([
    (0, class_validator_1.IsEnum)(skill_level_enum_1.SkillLevel),
    __metadata("design:type", String)
], UpdateSkillDTO.prototype, "level", void 0);
//# sourceMappingURL=update-skill.dto.js.map