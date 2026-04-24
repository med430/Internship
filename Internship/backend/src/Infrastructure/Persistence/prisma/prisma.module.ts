import {Module} from "@nestjs/common";
import {PrismaService} from "./prisma.service";
import { UserPrismaMapper } from './mappers/user.mapper';
import {OfferPrismaMapper} from "./mappers/offer.mapper";

@Module({
    providers: [PrismaService, UserPrismaMapper,OfferPrismaMapper],
    exports: [PrismaService, UserPrismaMapper],
})
export class PrismaModule {}