"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationMapper = void 0;
const common_1 = require("@nestjs/common");
const education_entity_1 = require("../../../../Domain/entities/education.entity");
let EducationMapper = class EducationMapper {
    toDomain(raw) {
        return new education_entity_1.Education(raw.id, raw.studentProfileId, raw.school, raw.degree, raw.field, raw.startDate, raw.endDate ?? undefined, raw.description ?? undefined, raw.createdAt, raw.updatedAt, raw.deletedAt ?? undefined);
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            studentProfileId: domain.studentProfileId,
            school: domain.school,
            degree: domain.degree,
            field: domain.field,
            startDate: domain.startDate,
            endDate: domain.endDate ?? null,
            description: domain.description ?? null,
            deletedAt: domain.deletedAt ?? null,
        };
    }
};
exports.EducationMapper = EducationMapper;
exports.EducationMapper = EducationMapper = __decorate([
    (0, common_1.Injectable)()
], EducationMapper);
//# sourceMappingURL=education.mapper.js.map