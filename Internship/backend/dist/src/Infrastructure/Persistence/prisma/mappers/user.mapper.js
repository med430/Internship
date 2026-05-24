"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../../../Domain/entities/user.entity");
let UserMapper = class UserMapper {
    toDomain(raw) {
        return new user_entity_1.User(raw.id, raw.email, raw.name, raw.lastname, raw.username, raw.passwordHash, raw.role, raw.phone ?? undefined, raw.avatarUrl ?? undefined, raw.createdAt, raw.updatedAt, raw.deletedAt ?? undefined);
    }
    toPersistence(domain) {
        return {
            id: domain.id,
            email: domain.email,
            name: domain.name,
            lastname: domain.lastname,
            username: domain.username,
            passwordHash: domain.passwordHash,
            role: domain.role,
            phone: domain.phone ?? null,
            avatarUrl: domain.avatarUrl ?? null,
            deletedAt: domain.deletedAt ?? null,
        };
    }
};
exports.UserMapper = UserMapper;
exports.UserMapper = UserMapper = __decorate([
    (0, common_1.Injectable)()
], UserMapper);
//# sourceMappingURL=user.mapper.js.map