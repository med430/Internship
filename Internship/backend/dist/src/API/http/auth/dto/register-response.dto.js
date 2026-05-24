"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterResponseDTO = void 0;
class RegisterResponseDTO {
    id;
    email;
    username;
    name;
    lastname;
    role;
    constructor(id, email, username, name, lastname, role) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.name = name;
        this.lastname = lastname;
        this.role = role;
    }
}
exports.RegisterResponseDTO = RegisterResponseDTO;
//# sourceMappingURL=register-response.dto.js.map