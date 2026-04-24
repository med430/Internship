import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from '../../Application/Services/AuthService/AuthService'

@Injectable()
export class JwtAuthService extends AuthService {

    constructor(private readonly jwtService: JwtService) {
        super()
    }

    async createJwtToken(
        username: string,
        roles: string[],
        userId: string
    ): Promise<string> {

        const payload = {
            username,
            roles,
            userId,
        }

        return this.jwtService.sign(payload)
    }
}