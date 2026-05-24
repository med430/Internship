"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const cqrs_1 = require("@nestjs/cqrs");
const config_1 = require("@nestjs/config");
const persistence_module_1 = require("../Persistence/persistence.module");
const auth_controller_1 = require("../../API/http/auth/auth.controller");
const AuthService_1 = require("../../Application/Services/AuthService/AuthService");
const jwt_auth_service_1 = require("./jwt-auth.service");
const jwt_strategy_1 = require("../../API/http/guards/jwt.strategy");
const login_handler_1 = require("../../Application/Features/AuthFeature/Commands/handlers/login.handler");
const register_student_handler_1 = require("../../Application/Features/AuthFeature/Commands/handlers/register-student.handler");
const register_recruiter_handler_1 = require("../../Application/Features/AuthFeature/Commands/handlers/register-recruiter.handler");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET'),
                    signOptions: { expiresIn: '1h' },
                }),
            }),
            persistence_module_1.PersistenceModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            login_handler_1.LoginHandler,
            register_student_handler_1.RegisterStudentHandler,
            register_recruiter_handler_1.RegisterRecruiterHandler,
            jwt_strategy_1.JwtStrategy,
            {
                provide: AuthService_1.AuthService,
                useClass: jwt_auth_service_1.JwtAuthService,
            },
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map