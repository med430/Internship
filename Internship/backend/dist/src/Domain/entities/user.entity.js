"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const base_entity_1 = require("./base.entity");
class User extends base_entity_1.BaseEntity {
    id;
    email;
    name;
    lastname;
    username;
    passwordHash;
    role;
    phone;
    avatarUrl;
    constructor(id, email, name, lastname, username, passwordHash, role, phone, avatarUrl, createdAt, updatedAt, deletedAt) {
        super(createdAt, updatedAt, deletedAt);
        this.id = id;
        this.email = email;
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map