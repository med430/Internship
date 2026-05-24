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
exports.SkillRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const skill_mapper_1 = require("../mappers/skill.mapper");
let SkillRepositoryImpl = class SkillRepositoryImpl {
    prisma;
    mapper;
    constructor(prisma, mapper) {
        this.prisma = prisma;
        this.mapper = mapper;
    }
    async findByIds(ids) {
        const results = await this.prisma.skill.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
        return results.map(r => this.mapper.toDomain(r));
    }
    async findByName(name) {
        const result = await this.prisma.skill.findUnique({
            where: { name }
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async findById(id) {
        const result = await this.prisma.skill.findUnique({
            where: { id }
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async findAll() {
        const results = await this.prisma.skill.findMany();
        return results.map(r => this.mapper.toDomain(r));
    }
    async findPaginated(pageNumber, pageSize) {
        const skip = (pageNumber - 1) * pageSize;
        const results = await this.prisma['skill'].findMany({
            skip,
            take: pageSize,
        });
        return results.map(r => this.mapper.toDomain(r));
    }
    async save(entity) {
        const result = await this.prisma.skill.create({
            data: {
                name: entity.name
            }
        });
        return this.mapper.toDomain(result);
    }
    async delete(id) {
        await this.prisma.skill.delete({
            where: { id }
        });
    }
};
exports.SkillRepositoryImpl = SkillRepositoryImpl;
exports.SkillRepositoryImpl = SkillRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        skill_mapper_1.SkillMapper])
], SkillRepositoryImpl);
//# sourceMappingURL=skill.repository.js.map