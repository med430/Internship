import {Module} from "@nestjs/common";
import {ApplicationModule} from "../../Application/Application.module";
import {AuthController} from "./auth/auth.controller";
import { CqrsModule } from '@nestjs/cqrs';

@Module({
    imports: [CqrsModule, ApplicationModule],
    controllers: [AuthController]
})
export class HttpApiModule {}