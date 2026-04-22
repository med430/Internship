import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {RegisterHandler} from "./Features/AuthFeature/Commands/handlers/register.handler";
import {LoginHandler} from "./Features/AuthFeature/Commands/handlers/login.handler";
import {AuthService} from "./Services/AuthService/AuthService";
import {PersistenceModule} from "../Infrastructure/Persistence/persistence.module";
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {JwtAuthService} from "../Infrastructure/auth/jwt-auth.service";


const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
];

@Module({
  imports: [
    CqrsModule,
    PersistenceModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get('JWT_EXPIRATION_TIME') || 3600)
        },
      }),
    }),
  ],

  providers: [
    ...CommandHandlers,
    {
      provide: AuthService,
      useClass: JwtAuthService,
    },
  ],

  exports: [
    CqrsModule // 🔥 🔥 🔥 AJOUTE ÇA
  ],
})
export class ApplicationModule {}