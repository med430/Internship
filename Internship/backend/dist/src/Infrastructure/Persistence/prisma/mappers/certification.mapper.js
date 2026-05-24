"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationMapper = void 0;
const common_1 = require("@nestjs/common");
const certification_entity_1 = require("../../../../Domain/entities/certification.entity");
let CertificationMapper = class CertificationMapper {
    toDomain(raw) {
        return new certification_entity_1.Certification(raw.id, raw.studentProfileId, raw.name, raw.organization, raw.issueDate, raw.expirationDate ?? undefined, raw.credentialId ?? undefined, raw.credentialUrl ?? undefined, raw.createdAt, raw.updatedAt, raw.deletedAt ?? undefined);
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            studentProfileId: domain.studentProfileId,
            name: domain.name,
            organization: domain.organization,
            issueDate: domain.issueDate,
            expirationDate: domain.expirationDate ?? null,
            credentialId: domain.credentialId ?? null,
            credentialUrl: domain.credentialUrl ?? null,
            deletedAt: domain.deletedAt ?? null,
        };
    }
};
exports.CertificationMapper = CertificationMapper;
exports.CertificationMapper = CertificationMapper = __decorate([
    (0, common_1.Injectable)()
], CertificationMapper);
//# sourceMappingURL=certification.mapper.js.map