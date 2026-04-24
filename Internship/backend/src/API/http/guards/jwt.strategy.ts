import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

import { IUserRepository } from '../../../Application/repositories/user.repository'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        config: ConfigService,

        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository
    ) {
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

        // 🔥 récupérer user depuis DB
        const user = await this.userRepo.findById(payload.userId)

        if (!user) {
            throw new UnauthorizedException()
        }

        // 🔥 BLOQUER SI SUPPRIMÉ
        if (user.deletedAt) {
            throw new UnauthorizedException('User deleted')
        }

        // 🔥 retourner user clean pour @CurrentUser()
        return {
            id: user.id,
            username: user.username,
            role: user.role
        }
    }
}