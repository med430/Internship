"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileResponseDTO = void 0;
class ProfileResponseDTO {
    id;
    email;
    username;
    name;
    lastname;
    role;
    phone;
    avatarUrl;
    constructor(id, email, username, name, lastname, role, phone, avatarUrl) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.name = name;
        this.lastname = lastname;
        this.role = role;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
    }
}
exports.ProfileResponseDTO = ProfileResponseDTO;
//# sourceMappingURL=profile-response.dto.js.map