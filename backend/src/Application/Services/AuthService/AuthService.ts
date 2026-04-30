export abstract class AuthService {
    abstract createJwtToken(
        username: string,
        roles: string[],
        userId: string // 🔥 AJOUT
    ): Promise<string>
}