"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillMapper = void 0;
const skill_entity_1 = require("../../../../Domain/entities/skill.entity");
class SkillMapper {
    toDomain(entity) {
        return new skill_entity_1.Skill(entity.id, entity.name);
    }
    toPersistence(entity) {
        return {
            id: entity.id,
            name: entity.name
        };
    }
}
exports.SkillMapper = SkillMapper;
//# sourceMappingURL=skill.mapper.js.map