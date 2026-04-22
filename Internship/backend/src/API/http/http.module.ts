import {Module} from "@nestjs/common";
import {ApplicationModule} from "../../Application/Application.module";
import {AuthController} from "./auth/auth.controller";

@Module({
    imports: [ApplicationModule],
    controllers: [AuthController]
})
export class HttpApiModule {}