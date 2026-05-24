import { IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../get-user.query';
import { IUserRepository } from '../../../../repositories/user.repository';
import { User } from '../../../../../Domain/entities/user.entity';
export declare class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(query: GetUserQuery): Promise<User | null>;
}
