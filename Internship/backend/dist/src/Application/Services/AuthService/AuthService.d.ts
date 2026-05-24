export declare abstract class AuthService {
    abstract createJwtToken(username: string, roles: string[], userId: string): Promise<string>;
}
