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
exports.CVRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const cv_mapper_1 = require("../mappers/cv.mapper");
const generic_repositories_1 = require("./generic.repositories");
let CVRepositoryImpl = class CVRepositoryImpl extends generic_repositories_1.GenericRepository {
    constructor(prisma, mapper) {
        super(prisma, 'cV', mapper);
    }
    async findByStudent(studentId) {
        const results = await this.prisma.cV.findMany({
            where: { studentId, deletedAt: null }
        });
        return results.map(r => this.mapper.toDomain(r));
    }
};
exports.CVRepositoryImpl = CVRepositoryImpl;
exports.CVRepositoryImpl = CVRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cv_mapper_1.CVMapper])
], CVRepositoryImpl);
//# sourceMappingURL=cv.repository.js.map