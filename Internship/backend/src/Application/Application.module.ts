import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {TypeOrmPersistenceModule} from "../Infrastrucutre/Persistence/typeorm/typeorm.module";
import {RegisterHandler} from "./Features/AuthFeature/Commands/handlers/register.handler";
import {LoginHandler} from "./Features/AuthFeature/Commands/handlers/login.handler";

@Module({
    imports: [
        CqrsModule,
        TypeOrmPersistenceModule
    ],
    providers: [
        RegisterHandler,
        LoginHandler
    ]
})
export class ApplicationModule {}