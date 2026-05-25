// jwt.strategy.ts
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { IUserRepository } from '../../../Application/repositories/user.repository'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @Inject(ConfigService)          // ← ajout @Inject explicite
        config: ConfigService,

        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET') ?? '',
        })
    }

    async validate(payload: any) {
        if (!payload || !payload.userId) {
            throw new UnauthorizedException()
        }

        const user = await this.userRepo.findById(payload.userId)
        if (!user) throw new UnauthorizedException()

        if (user.deletedAt) {
            throw new UnauthorizedException('User deleted')
        }

        return {
            id: user.id,
            username: user.username,
            role: user.role
        }
    }
}