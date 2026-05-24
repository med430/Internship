"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterStudentCommand = void 0;
class RegisterStudentCommand {
    email;
    name;
    lastname;
    username;
    password;
    constructor(email, name, lastname, username, password) {
        this.email = email;
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.password = password;
    }
}
exports.RegisterStudentCommand = RegisterStudentCommand;
//# sourceMappingURL=register-student.command.js.map