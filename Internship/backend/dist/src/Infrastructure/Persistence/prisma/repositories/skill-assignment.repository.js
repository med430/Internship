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
exports.SkillAssignmentRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const skill_assignment_mapper_1 = require("../mappers/skill-assignment.mapper");
const generic_repositories_1 = require("./generic.repositories");
let SkillAssignmentRepositoryImpl = class SkillAssignmentRepositoryImpl extends generic_repositories_1.GenericRepository {
    constructor(prisma, mapper) {
        super(prisma, 'skillAssignment', mapper);
    }
    async findByStudentAndSkill(studentProfileId, skillId) {
        const result = await this.prisma.skillAssignment.findFirst({
            where: { studentProfileId, skillId }
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async updateLevel(id, level) {
        const result = await this.prisma.skillAssignment.update({
            where: { id },
            data: { level }
        });
        return this.mapper.toDomain(result);
    }
};
exports.SkillAssignmentRepositoryImpl = SkillAssignmentRepositoryImpl;
exports.SkillAssignmentRepositoryImpl = SkillAssignmentRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, skill_assignment_mapper_1.SkillAssignmentMapper])
], SkillAssignmentRepositoryImpl);
//# sourceMappingURL=skill-assignment.repository.js.map