"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillAssignmentMapper = void 0;
const common_1 = require("@nestjs/common");
const skill_assignment_entity_1 = require("../../../../Domain/entities/skill-assignment.entity");
let SkillAssignmentMapper = class SkillAssignmentMapper {
    toDomain(raw) {
        return new skill_assignment_entity_1.SkillAssignment(raw.id, raw.skillId, raw.studentProfileId, raw.level);
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            skillId: domain.skillId,
            studentProfileId: domain.studentProfileId,
            level: domain.level,
        };
    }
};
exports.SkillAssignmentMapper = SkillAssignmentMapper;
exports.SkillAssignmentMapper = SkillAssignmentMapper = __decorate([
    (0, common_1.Injectable)()
], SkillAssignmentMapper);
//# sourceMappingURL=skill-assignment.mapper.js.map