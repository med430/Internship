import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {RegisterHandler} from "./Features/AuthFeature/Commands/handlers/register.handler";
import {LoginHandler} from "./Features/AuthFeature/Commands/handlers/login.handler";
import {IAuthService} from "./Services/AuthService/IAuthService";
import {AuthService} from "./Services/AuthService/AuthService";
import {PersistenceModule} from "../Infrastructure/Persistence/persistence.module";

@Module({
    imports: [
        CqrsModule,
        PersistenceModule
    ],
    providers: [
        RegisterHandler,
        LoginHandler,
        {
            provide: IAuthService,
            useClass: AuthService,
        },
    ],
})
export class ApplicationModule {}