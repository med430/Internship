import {Module} from "@nestjs/common";
import {UserRepository} from "./prisma/repositories/user.prisma.repository";
import {IUserRepository} from "../../Application/Interfaces/user.repository.interface";

@Module({
    imports: [],
    providers: [
        {
            provide: IUserRepository,
            useClass: UserRepository
        }
    ],
    exports: [IUserRepository],
})
export class PersistenceModule {}