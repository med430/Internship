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
exports.RecruiterProfileRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const recruiter_profile_mapper_1 = require("../mappers/recruiter-profile.mapper");
const generic_repositories_1 = require("./generic.repositories");
const RECRUITER_PROFILE_INCLUDE = {
    offers: {
        include: {
            skillRequirements: {
                include: { skill: true }
            }
        }
    }
};
let RecruiterProfileRepositoryImpl = class RecruiterProfileRepositoryImpl extends generic_repositories_1.GenericRepository {
    includeOptions = {
        offers: {
            include: {
                skillRequirements: {
                    include: { skill: true }
                }
            }
        }
    };
    constructor(prisma, mapper) {
        super(prisma, 'recruiterProfile', mapper);
    }
    async findById(id) {
        const result = await this.prisma.recruiterProfile.findUnique({
            where: { id },
            include: RECRUITER_PROFILE_INCLUDE
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async findByUserId(userId) {
        const result = await this.prisma.recruiterProfile.findUnique({
            where: { userId },
            include: RECRUITER_PROFILE_INCLUDE
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async update(profile) {
        const result = await this.prisma.recruiterProfile.update({
            where: { id: profile.id },
            data: this.mapper.toPersistence(profile),
            include: RECRUITER_PROFILE_INCLUDE
        });
        return this.mapper.toDomain(result);
    }
};
exports.RecruiterProfileRepositoryImpl = RecruiterProfileRepositoryImpl;
exports.RecruiterProfileRepositoryImpl = RecruiterProfileRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, recruiter_profile_mapper_1.RecruiterProfileMapper])
], RecruiterProfileRepositoryImpl);
//# sourceMappingURL=recruiter-profile.repository.js.map