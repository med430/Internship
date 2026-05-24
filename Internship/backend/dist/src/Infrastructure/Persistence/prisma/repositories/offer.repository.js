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
exports.OfferRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const offer_mapper_1 = require("../mappers/offer.mapper");
const generic_repositories_1 = require("./generic.repositories");
const OFFER_INCLUDE = {
    skillRequirements: {
        include: { skill: true }
    }
};
let OfferRepositoryImpl = class OfferRepositoryImpl extends generic_repositories_1.GenericRepository {
    includeOptions = {
        skillRequirements: {
            include: { skill: true }
        }
    };
    constructor(prisma, mapper) {
        super(prisma, 'offer', mapper);
    }
    async save(entity) {
        const { skillRequirements, id, recruiterProfileId, ...updateData } = this.mapper.toPersistence(entity);
        const result = await this.prisma.offer.upsert({
            where: { id: entity.id },
            create: {
                id,
                recruiterProfileId,
                ...updateData,
                skillRequirements
            },
            update: {
                ...updateData,
                skillRequirements: {
                    deleteMany: { offerId: entity.id },
                    create: skillRequirements.create,
                }
            },
            include: this.includeOptions
        });
        return this.mapper.toDomain(result);
    }
    async findById(id) {
        const result = await this.prisma.offer.findUnique({
            where: { id },
            include: this.includeOptions
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async findAll() {
        const results = await this.prisma.offer.findMany({
            where: { deletedAt: null },
            include: this.includeOptions
        });
        return results.map(r => this.mapper.toDomain(r));
    }
    async findByRecruiter(recruiterId) {
        const results = await this.prisma.offer.findMany({
            where: { recruiterProfileId: recruiterId, deletedAt: null },
            include: this.includeOptions
        });
        return results.map(r => this.mapper.toDomain(r));
    }
};
exports.OfferRepositoryImpl = OfferRepositoryImpl;
exports.OfferRepositoryImpl = OfferRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, offer_mapper_1.OfferMapper])
], OfferRepositoryImpl);
//# sourceMappingURL=offer.repository.js.map