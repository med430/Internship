"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentProfileMapper = void 0;
const common_1 = require("@nestjs/common");
const student_profile_entity_1 = require("../../../../Domain/entities/student-profile.entity");
const experience_entity_1 = require("../../../../Domain/entities/experience.entity");
const cv_entity_1 = require("../../../../Domain/entities/cv.entity");
const certification_entity_1 = require("../../../../Domain/entities/certification.entity");
const skill_assignment_entity_1 = require("../../../../Domain/entities/skill-assignment.entity");
const education_entity_1 = require("../../../../Domain/entities/education.entity");
const project_entity_1 = require("../../../../Domain/entities/project.entity");
let StudentProfileMapper = class StudentProfileMapper {
    toDomain(raw) {
        return new student_profile_entity_1.StudentProfile(raw.id, raw.userId, raw.bio ?? undefined, raw.birthDate ?? undefined, raw.gender ? raw.gender : undefined, raw.address ?? undefined, raw.city ?? undefined, raw.skills.map(s => new skill_assignment_entity_1.SkillAssignment(s.id, s.skillId, s.studentProfileId, s.level)), raw.experiences.map(e => new experience_entity_1.Experience(e.id, e.studentProfileId, e.company, e.role, e.startDate, e.endDate ?? undefined, e.description ?? undefined, e.createdAt, e.updatedAt, e.deletedAt ?? undefined)), raw.projects.map(p => new project_entity_1.Project(p.id, p.studentProfileId, p.title, p.description, p.technologies, p.githubUrl ?? undefined, p.demoUrl ?? undefined)), raw.educations.map(e => new education_entity_1.Education(e.id, e.studentProfileId, e.school, e.degree, e.field, e.startDate, e.endDate ?? undefined, e.description ?? undefined, e.createdAt, e.updatedAt, e.deletedAt ?? undefined)), raw.certifications.map(c => new certification_entity_1.Certification(c.id, c.studentProfileId, c.name, c.organization, c.issueDate, c.expirationDate ?? undefined, c.credentialId ?? undefined, c.credentialUrl ?? undefined, c.createdAt, c.updatedAt, c.deletedAt ?? undefined)), raw.cvs.map(cv => new cv_entity_1.CV(cv.id, cv.studentId, cv.fileUrl, cv.createdAt, cv.updatedAt, cv.deletedAt ?? undefined)));
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            userId: domain.userId,
            bio: domain.bio ?? null,
            birthDate: domain.birthDate ?? null,
            gender: domain.gender ?? null,
            address: domain.address ?? null,
            city: domain.city ?? null,
        };
    }
};
exports.StudentProfileMapper = StudentProfileMapper;
exports.StudentProfileMapper = StudentProfileMapper = __decorate([
    (0, common_1.Injectable)()
], StudentProfileMapper);
//# sourceMappingURL=student-profile.mapper.js.map