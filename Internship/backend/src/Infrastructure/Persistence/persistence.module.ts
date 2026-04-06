import {Module} from "@nestjs/common";
import {UserRepository} from "./prisma/repositories/user.prisma.repository";
import {IUserRepository} from "../../Application/repositories/user.repository";
import {PrismaModule} from "./prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    providers: [
        {
            provide: IUserRepository,
            useClass: UserRepository
        }
    ],
    exports: [IUserRepository],
})
export class PersistenceModule {}