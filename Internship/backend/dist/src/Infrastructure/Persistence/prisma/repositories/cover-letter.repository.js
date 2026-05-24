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
exports.CoverLetterRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const cover_letter_mapper_1 = require("../mappers/cover-letter.mapper");
const generic_repositories_1 = require("./generic.repositories");
let CoverLetterRepositoryImpl = class CoverLetterRepositoryImpl extends generic_repositories_1.GenericRepository {
    constructor(prisma, mapper) {
        super(prisma, 'coverLetter', mapper);
    }
    async findByStudent(studentId) {
        const results = await this.prisma.coverLetter.findMany({
            where: { studentId, deletedAt: null }
        });
        return results.map(r => this.mapper.toDomain(r));
    }
};
exports.CoverLetterRepositoryImpl = CoverLetterRepositoryImpl;
exports.CoverLetterRepositoryImpl = CoverLetterRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cover_letter_mapper_1.CoverLetterMapper])
], CoverLetterRepositoryImpl);
//# sourceMappingURL=cover-letter.repository.js.map