import {Global, Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {RegisterHandler} from "./Features/AuthFeature/Commands/handlers/register.handler";
import {LoginHandler} from "./Features/AuthFeature/Commands/handlers/login.handler";
import {AuthService} from "./Services/AuthService/AuthService";
import {PersistenceModule} from "../Infrastructure/Persistence/persistence.module";
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {JwtAuthService} from "../Infrastructure/auth/jwt-auth.service";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "../API/http/guards/jwt.strategy";
import {CreateOfferHandler} from "./Features/OfferFeature/Commands/handlers/create-offer.handler";
import {UpdateOfferHandler} from "./Features/OfferFeature/Commands/handlers/update-offer.handler";
import {DeleteOfferHandler} from "./Features/OfferFeature/Commands/handlers/delete-offer.handler";
import {ApplyToOfferHandler} from "./Features/ApplicationFeature/Commands/handlers/apply-offer.handler";
import { GetUsersQueryHandler } from './Features/UserFeature/Queries/handlers/get-users-query.handler';
import { GetOffersQueryHandler } from './Features/OfferFeature/Queries/handlers/get-offers-query.handler';
import { GetOfferQueryHandler } from './Features/OfferFeature/Queries/handlers/get-offer-query.handler';
import { GetUserQueryHandler } from './Features/UserFeature/Queries/handlers/get-user-query.handler';
import { GetSkillQueryHandler } from './Features/SkillFeature/Queries/handlers/get-skill-query.handler';
import { GetSkillsQueryHandler } from './Features/SkillFeature/Queries/handlers/get-skills-query.handler';
import {
  UpdateApplicationStatusHandler
} from "./Features/ApplicationFeature/Commands/handlers/update-application-status.handler";
import {WithdrawApplicationHandler} from "./Features/ApplicationFeature/Commands/handlers/withdraw-application.handler";


const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  CreateOfferHandler,
  UpdateOfferHandler,
  DeleteOfferHandler,
  ApplyToOfferHandler,
  UpdateApplicationStatusHandler,
  WithdrawApplicationHandler
];

const QueryHandlers = [
  GetUserQueryHandler,
  GetUsersQueryHandler,
  GetOfferQueryHandler,
  GetOffersQueryHandler,
  GetSkillQueryHandler,
  GetSkillsQueryHandler,
];

@Global()
@Module({
  imports: [
    CqrsModule,
    PersistenceModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
      JwtStrategy,
    {
      provide: AuthService,
      useClass: JwtAuthService,
    },
  ],

  exports: [
    CqrsModule
  ],
})
export class ApplicationModule {}