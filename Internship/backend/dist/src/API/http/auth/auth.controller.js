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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const login_dto_1 = require("./dto/login.dto");
const register_student_dto_1 = require("./dto/register-student.dto");
const register_recruiter_dto_1 = require("./dto/register-recruiter.dto");
const login_command_1 = require("../../../Application/Features/AuthFeature/Commands/login.command");
const register_student_command_1 = require("../../../Application/Features/AuthFeature/Commands/register-student.command");
const register_recruiter_command_1 = require("../../../Application/Features/AuthFeature/Commands/register-recruiter.command");
let AuthController = class AuthController {
    commandBus;
    constructor(commandBus) {
        this.commandBus = commandBus;
    }
    login(dto) {
        return this.commandBus.execute(new login_command_1.LoginCommand(dto.email, dto.password));
    }
    registerStudent(dto) {
        return this.commandBus.execute(new register_student_command_1.RegisterStudentCommand(dto.email, dto.name, dto.lastname, dto.username, dto.password));
    }
    registerRecruiter(dto) {
        return this.commandBus.execute(new register_recruiter_command_1.RegisterRecruiterCommand(dto.email, dto.name, dto.lastname, dto.username, dto.password, dto.company, dto.companyDescription, dto.website));
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register/student'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_student_dto_1.RegisterStudentDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerStudent", null);
__decorate([
    (0, common_1.Post)('register/recruiter'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_recruiter_dto_1.RegisterRecruiterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerRecruiter", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], AuthController);
//# sourceMappingURL=auth.controller.js.map