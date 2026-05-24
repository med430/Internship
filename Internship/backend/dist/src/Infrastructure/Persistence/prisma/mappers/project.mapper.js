"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMapper = void 0;
const common_1 = require("@nestjs/common");
const project_entity_1 = require("../../../../Domain/entities/project.entity");
let ProjectMapper = class ProjectMapper {
    toDomain(raw) {
        return new project_entity_1.Project(raw.id, raw.studentProfileId, raw.title, raw.description, raw.technologies, raw.githubUrl ?? undefined, raw.demoUrl ?? undefined);
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            studentProfileId: domain.studentProfileId,
            title: domain.title,
            description: domain.description,
            technologies: domain.technologies,
            githubUrl: domain.githubUrl ?? null,
            demoUrl: domain.demoUrl ?? null,
        };
    }
};
exports.ProjectMapper = ProjectMapper;
exports.ProjectMapper = ProjectMapper = __decorate([
    (0, common_1.Injectable)()
], ProjectMapper);
//# sourceMappingURL=project.mapper.js.map