import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { CqrsModule } from '@nestjs/cqrs'
import { ConfigModule, ConfigService } from '@nestjs/config'


// 🔥 IMPORT ICI
import { PersistenceModule } from '../Persistence/persistence.module'
import {LoginHandler} from "../../Application/Features/AuthFeature/Commands/handlers/login.handler";
import {JwtStrategy} from "../../API/http/guards/jwt.strategy";
import {RegisterHandler} from "../../Application/Features/AuthFeature/Commands/handlers/register.handler";
import {AuthController} from "../../API/http/auth/auth.controller";
import {AuthService} from "../../Application/Services/AuthService/AuthService";
import {JwtAuthService} from "./jwt-auth.service";

@Module({
    imports: [
        CqrsModule,
        ConfigModule,

        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
        }),

        PersistenceModule, // 🔥
    ],

    controllers: [AuthController],

    providers: [
        RegisterHandler,
        LoginHandler,
        JwtStrategy,

        {
            provide: AuthService,
            useClass: JwtAuthService,
        },
    ],
})
export class AuthModule {}