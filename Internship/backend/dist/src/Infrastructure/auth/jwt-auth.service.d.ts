import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../Application/Services/AuthService/AuthService';
export declare class JwtAuthService extends AuthService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    createJwtToken(username: string, roles: string[], userId: string): Promise<string>;
}
