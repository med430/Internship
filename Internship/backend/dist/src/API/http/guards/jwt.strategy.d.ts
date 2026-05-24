import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../../Application/repositories/user.repository';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepo;
    constructor(config: ConfigService, userRepo: IUserRepository);
    validate(payload: any): Promise<{
        id: string;
        username: string;
        role: import("../../../Domain/enums/role.enum").Role;
    }>;
}
export {};
