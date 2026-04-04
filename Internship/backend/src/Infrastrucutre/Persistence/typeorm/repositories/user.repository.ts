import {Injectable} from "@nestjs/common";
import {GenericRepository} from "./generic.repository";
import {UserOrmEntity} from "../entities/user.orm-entity";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {UserMapper} from "../mappers/user.mapper";
import {User} from "../../../../Domain/user.entity";
import {IUserRepository} from "../../../../Application/Intrerfaces/user.repository.interface";

@Injectable()
export class UserRepository extends GenericRepository<UserOrmEntity> implements IUserRepository {
    constructor(
        @InjectRepository(UserOrmEntity)
        private readonly userRepository: Repository<UserOrmEntity>
    ) {
        super(userRepository);
    }

    async findByUsername(username: string): Promise<User | null> {
        const entity = await this.repository.findOne({ where: { username } });
        return entity ? UserMapper.toDomain(entity) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const entity = await this.repository.findOne({ where: { email } });
        return entity ? UserMapper.toDomain(entity) : null;
    }

    async save(user: User): Promise<User> {
        const entity = UserMapper.toOrm(user);
        const saved = await super.save(entity);
        return UserMapper.toDomain(saved);
    }
}