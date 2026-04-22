import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET'),
        })
    }

    async validate(payload: any) {

        if (!payload || !payload.userId) {
            throw new UnauthorizedException()
        }

        // 🔥 IMPORTANT : format propre pour ton app
        return {
            id: payload.userId,
            username: payload.username,
            roles: payload.roles,
        }
    }
}