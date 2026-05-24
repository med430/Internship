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
exports.ApplicationRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const application_mapper_1 = require("../mappers/application.mapper");
const generic_repositories_1 = require("./generic.repositories");
const application_status_enum_1 = require("../../../../Domain/enums/application-status.enum");
let ApplicationRepositoryImpl = class ApplicationRepositoryImpl extends generic_repositories_1.GenericRepository {
    constructor(prisma, mapper) {
        super(prisma, 'application', mapper);
    }
    async findByStudentAndOffer(studentId, offerId) {
        const result = await this.prisma.application.findUnique({
            where: { studentId_offerId: { studentId, offerId } }
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async findByStudent(studentId) {
        const results = await this.prisma.application.findMany({
            where: { studentId, deletedAt: null }
        });
        return results.map(r => this.mapper.toDomain(r));
    }
    async findByOffer(offerId) {
        const results = await this.prisma.application.findMany({
            where: { offerId, deletedAt: null }
        });
        return results.map(r => this.mapper.toDomain(r));
    }
    async rejectAllExcept(offerId, acceptedId) {
        await this.prisma.application.updateMany({
            where: {
                offerId,
                id: { not: acceptedId },
                deletedAt: null
            },
            data: { status: application_status_enum_1.ApplicationStatus.REJECTED }
        });
    }
    async existsByCvId(cvId) {
        const count = await this.prisma.application.count({
            where: { cvId, deletedAt: null }
        });
        return count > 0;
    }
    async existsByCoverLetterId(coverLetterId) {
        const count = await this.prisma.application.count({
            where: { coverLetterId, deletedAt: null }
        });
        return count > 0;
    }
};
exports.ApplicationRepositoryImpl = ApplicationRepositoryImpl;
exports.ApplicationRepositoryImpl = ApplicationRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        application_mapper_1.ApplicationMapper])
], ApplicationRepositoryImpl);
//# sourceMappingURL=application.repository.js.map