import {Module} from "@nestjs/common";
import {User} from "../../../Domain/user.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserRepository} from "./repositories/user.repository";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [
        {
            provide: 'IUserRepository',
            useClass: UserRepository
        }
    ],
    exports: ['IUserRepository']
})
export class TypeOrmPersistenceModule {}