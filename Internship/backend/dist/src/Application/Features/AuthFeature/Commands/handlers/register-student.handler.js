"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterStudentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
const register_student_command_1 = require("../register-student.command");
const user_repository_1 = require("../../../../repositories/user.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const user_entity_1 = require("../../../../../Domain/entities/user.entity");
const role_enum_1 = require("../../../../../Domain/enums/role.enum");
const generic_command_handler_1 = require("../../../GenericFeature/Commands/handlers/generic-command.handler");
const register_response_dto_1 = require("../../../../../API/http/auth/dto/register-response.dto");
const student_profile_entity_1 = require("../../../../../Domain/entities/student-profile.entity");
let RegisterStudentHandler = class RegisterStudentHandler extends generic_command_handler_1.GenericCommandHandler {
    userRepo;
    studentProfileRepo;
    constructor(userRepo, studentProfileRepo) {
        super();
        this.userRepo = userRepo;
        this.studentProfileRepo = studentProfileRepo;
    }
    async map(command) {
        const hashedPassword = await bcrypt.hash(command.password, 10);
        return new user_entity_1.User((0, crypto_1.randomUUID)(), command.email, command.name, command.lastname, command.username, hashedPassword, role_enum_1.Role.STUDENT);
    }
    async persist(user) {
        const existing = await this.userRepo.findByEmail(user.email);
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const savedUser = await this.userRepo.save(user);
        await this.studentProfileRepo.save(new student_profile_entity_1.StudentProfile((0, crypto_1.randomUUID)(), savedUser.id));
        return new register_response_dto_1.RegisterResponseDTO(savedUser.id, savedUser.email, savedUser.username, savedUser.name, savedUser.lastname, savedUser.role);
    }
};
exports.RegisterStudentHandler = RegisterStudentHandler;
exports.RegisterStudentHandler = RegisterStudentHandler = __decorate([
    (0, cqrs_1.CommandHandler)(register_student_command_1.RegisterStudentCommand),
    __param(0, (0, common_1.Inject)(user_repository_1.IUserRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], RegisterStudentHandler);
//# sourceMappingURL=register-student.handler.js.map