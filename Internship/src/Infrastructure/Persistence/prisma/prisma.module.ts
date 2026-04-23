import {Module} from "@nestjs/common";
import {PrismaService} from "./prisma.service";
import { UserPrismaMapper } from './mappers/user.mapper';

@Module({
    providers: [PrismaService, UserPrismaMapper],
    exports: [PrismaService, UserPrismaMapper],
})
export class PrismaModule {}