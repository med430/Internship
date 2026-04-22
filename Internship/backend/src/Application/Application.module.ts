import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {RegisterHandler} from "./Features/AuthFeature/Commands/handlers/register.handler";
import {LoginHandler} from "./Features/AuthFeature/Commands/handlers/login.handler";
import {IAuthService} from "./Services/AuthService/IAuthService";
import {AuthService} from "./Services/AuthService/AuthService";
import {PersistenceModule} from "../Infrastructure/Persistence/persistence.module";
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GetUsersQueryHandler } from './Features/UserFeature/Queries/handlers/get-users-query.handler';

@Module({
  imports: [
    CqrsModule,
    PersistenceModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get<string>('JWT_EXPIRATION_TIME')),
        },
      }),
    }),
  ],
  providers: [
    RegisterHandler,
    LoginHandler,
    GetUsersQueryHandler,
    {
      provide: AuthService,
      useClass: JwtAuthService,
    },
  ],
})
export class ApplicationModule {}