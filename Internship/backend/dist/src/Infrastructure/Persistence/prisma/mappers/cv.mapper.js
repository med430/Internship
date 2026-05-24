"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CVMapper = void 0;
const common_1 = require("@nestjs/common");
const cv_entity_1 = require("../../../../Domain/entities/cv.entity");
let CVMapper = class CVMapper {
    toDomain(raw) {
        return new cv_entity_1.CV(raw.id, raw.studentId, raw.fileUrl, raw.createdAt, raw.updatedAt, raw.deletedAt ?? undefined);
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            studentId: domain.studentId,
            fileUrl: domain.fileUrl,
            deletedAt: domain.deletedAt ?? null,
        };
    }
};
exports.CVMapper = CVMapper;
exports.CVMapper = CVMapper = __decorate([
    (0, common_1.Injectable)()
], CVMapper);
//# sourceMappingURL=cv.mapper.js.map