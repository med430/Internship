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
exports.UserRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const user_mapper_1 = require("../mappers/user.mapper");
const generic_repositories_1 = require("./generic.repositories");
let UserRepositoryImpl = class UserRepositoryImpl extends generic_repositories_1.GenericRepository {
    constructor(prisma, mapper) {
        super(prisma, 'user', mapper);
    }
    async findByEmail(email) {
        const result = await this.prisma.user.findUnique({
            where: { email }
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async findByUsername(username) {
        const result = await this.prisma.user.findUnique({
            where: { username }
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async softDelete(id) {
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
    async update(user) {
        const result = await this.prisma.user.update({
            where: { id: user.id },
            data: this.mapper.toPersistence(user)
        });
        return this.mapper.toDomain(result);
    }
};
exports.UserRepositoryImpl = UserRepositoryImpl;
exports.UserRepositoryImpl = UserRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        user_mapper_1.UserMapper])
], UserRepositoryImpl);
//# sourceMappingURL=user.prisma.repository.js.map