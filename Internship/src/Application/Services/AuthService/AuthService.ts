export abstract class AuthService {
    abstract createJwtToken(username: string, roles: string[]): Promise<string>
}