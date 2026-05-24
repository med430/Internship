"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationMapper = void 0;
const common_1 = require("@nestjs/common");
const application_entity_1 = require("../../../../Domain/entities/application.entity");
let ApplicationMapper = class ApplicationMapper {
    toDomain(raw) {
        return new application_entity_1.Application(raw.id, raw.studentId, raw.offerId, raw.cvId, raw.status, raw.matchScore ?? 0, raw.coverLetterId ?? undefined, raw.createdAt, raw.updatedAt, raw.deletedAt ?? undefined);
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            studentId: domain.studentId,
            offerId: domain.offerId,
            cvId: domain.cvId,
            status: domain.status,
            matchScore: domain.matchScore,
            coverLetterId: domain.coverLetterId ?? null,
            deletedAt: domain.deletedAt ?? null,
        };
    }
};
exports.ApplicationMapper = ApplicationMapper;
exports.ApplicationMapper = ApplicationMapper = __decorate([
    (0, common_1.Injectable)()
], ApplicationMapper);
//# sourceMappingURL=application.mapper.js.map