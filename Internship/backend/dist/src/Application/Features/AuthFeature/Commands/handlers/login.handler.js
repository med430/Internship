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
exports.LoginHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
const login_command_1 = require("../login.command");
const user_repository_1 = require("../../../../repositories/user.repository");
const AuthService_1 = require("../../../../Services/AuthService/AuthService");
const generic_command_handler_1 = require("../../../GenericFeature/Commands/handlers/generic-command.handler");
let LoginHandler = class LoginHandler extends generic_command_handler_1.GenericCommandHandler {
    userRepo;
    authService;
    constructor(userRepo, authService) {
        super();
        this.userRepo = userRepo;
        this.authService = authService;
    }
    async map(command) {
        const user = await this.userRepo.findByEmail(command.email);
        if (!user)
            throw new common_1.UnauthorizedException();
        const isMatch = await bcrypt.compare(command.password, user.passwordHash);
        if (!isMatch)
            throw new common_1.UnauthorizedException();
        return user;
    }
    async persist(user) {
        const token = await this.authService.createJwtToken(user.username, [user.role], user.id);
        return { token };
    }
};
exports.LoginHandler = LoginHandler;
exports.LoginHandler = LoginHandler = __decorate([
    (0, cqrs_1.CommandHandler)(login_command_1.LoginCommand),
    __param(0, (0, common_1.Inject)(user_repository_1.IUserRepository)),
    __metadata("design:paramtypes", [Object, AuthService_1.AuthService])
], LoginHandler);
//# sourceMappingURL=login.handler.js.map