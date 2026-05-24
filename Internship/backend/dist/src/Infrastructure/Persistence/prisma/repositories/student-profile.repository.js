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
exports.StudentProfileRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const student_profile_mapper_1 = require("../mappers/student-profile.mapper");
const generic_repositories_1 = require("./generic.repositories");
const STUDENT_PROFILE_INCLUDE = {
    skills: true,
    experiences: true,
    projects: true,
    educations: true,
    certifications: true,
    cvs: true,
};
let StudentProfileRepositoryImpl = class StudentProfileRepositoryImpl extends generic_repositories_1.GenericRepository {
    includeOptions = {
        skills: true,
        experiences: true,
        projects: true,
        educations: true,
        certifications: true,
        cvs: true,
    };
    constructor(prisma, mapper) {
        super(prisma, 'studentProfile', mapper);
    }
    async findById(id) {
        const result = await this.prisma.studentProfile.findUnique({
            where: { id },
            include: this.includeOptions
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async findByUserId(userId) {
        const result = await this.prisma.studentProfile.findUnique({
            where: { userId },
            include: this.includeOptions
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async update(profile) {
        const result = await this.prisma.studentProfile.update({
            where: { id: profile.id },
            data: this.mapper.toPersistence(profile),
            include: this.includeOptions
        });
        return this.mapper.toDomain(result);
    }
};
exports.StudentProfileRepositoryImpl = StudentProfileRepositoryImpl;
exports.StudentProfileRepositoryImpl = StudentProfileRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, student_profile_mapper_1.StudentProfileMapper])
], StudentProfileRepositoryImpl);
//# sourceMappingURL=student-profile.repository.js.map