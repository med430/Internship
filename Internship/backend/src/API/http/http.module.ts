import {Module} from "@nestjs/common";
import {ApplicationModule} from "../../Application/Application.module";
import {AuthController} from "./auth/auth.controller";
import {OfferController} from "./offer/offer.controller";
import {ApplicationController} from "./application/application.controller";

@Module({
    imports: [ApplicationModule],
    controllers: [AuthController, OfferController, ApplicationController]
})
export class HttpApiModule {}