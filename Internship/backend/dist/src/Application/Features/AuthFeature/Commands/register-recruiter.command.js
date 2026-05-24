"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRecruiterCommand = void 0;
class RegisterRecruiterCommand {
    email;
    name;
    lastname;
    username;
    password;
    company;
    companyDescription;
    website;
    constructor(email, name, lastname, username, password, company, companyDescription, website) {
        this.email = email;
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.password = password;
        this.company = company;
        this.companyDescription = companyDescription;
        this.website = website;
    }
}
exports.RegisterRecruiterCommand = RegisterRecruiterCommand;
//# sourceMappingURL=register-recruiter.command.js.map