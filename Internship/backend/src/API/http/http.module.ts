import {Module} from "@nestjs/common";
import {ApplicationModule} from "../../Application/Application.module";
import {AuthController} from "./auth/auth.controller";
import {OfferController} from "./offer/offer.controller";

@Module({
    imports: [ApplicationModule],
    controllers: [AuthController, OfferController]
})
export class HttpApiModule {}