import { User } from '../../../Domain/entities/user.entity';
import { QueryBus } from '@nestjs/cqrs';
export declare class UserResolver {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    getUser(id: string): Promise<any>;
    getUsers(pageNumber: number, pageSize: number): Promise<User[]>;
}
