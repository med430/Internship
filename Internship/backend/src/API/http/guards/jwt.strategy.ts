import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import {IUserRepository} from "../../../Application/repositories/user.repository";
import { Inject } from '@nestjs/common'
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @Inject(IUserRepository)
        private userRepo: IUserRepository,
        config: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET')
        })
    }

    async validate(payload: any) {
        const user = await this.userRepo.findByUsername(payload.username)

        if (!user) throw new UnauthorizedException()

        return user
    }
}