import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {RegisterHandler} from "./Features/AuthFeature/Commands/handlers/register.handler";
import {LoginHandler} from "./Features/AuthFeature/Commands/handlers/login.handler";
import {AuthService} from "./Services/AuthService/AuthService";
import {PersistenceModule} from "../Infrastructure/Persistence/persistence.module";
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {JwtAuthService} from "../Infrastructure/auth/jwt-auth.service";
import { GetUsersQueryHandler } from './Features/UserFeature/Queries/handlers/get-users-query.handler';
import { GetOffersQueryHandler } from './Features/OfferFeature/Queries/handlers/get-offers-query.handler';
import { GetOfferQueryHandler } from './Features/OfferFeature/Queries/handlers/get-offer-query.handler';
import { GetUserQueryHandler } from './Features/UserFeature/Queries/handlers/get-user-query.handler';
import { GetSkillQueryHandler } from './Features/SkillFeature/Queries/handlers/get-skill-query.handler';
import { GetSkillsQueryHandler } from './Features/SkillFeature/Queries/handlers/get-skills-query.handler';


const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
];

const QueryHandlers = [
  GetUserQueryHandler,
  GetUsersQueryHandler,
  GetOfferQueryHandler,
  GetOffersQueryHandler,
  GetSkillQueryHandler,
  GetSkillsQueryHandler,
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
    ...QueryHandlers,
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