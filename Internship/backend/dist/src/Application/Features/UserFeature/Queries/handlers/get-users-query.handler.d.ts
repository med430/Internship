import { IQueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../get-users.query';
import { User } from '../../../../../Domain/entities/user.entity';
import { IUserRepository } from '../../../../repositories/user.repository';
export declare class GetUsersQueryHandler implements IQueryHandler<GetUsersQuery> {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(query: GetUsersQuery): Promise<User[]>;
}
