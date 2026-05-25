import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { IUserRepository } from '../../../Application/repositories/user.repository'

@Injectable()
export class SseAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(IUserRepository) private readonly userRepo: IUserRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const token = req.query.token as string | undefined

        if (!token) throw new UnauthorizedException()

        try {
            const payload = this.jwtService.verify<{ userId: string }>(token)
            const user = await this.userRepo.findById(payload.userId)
            if (!user || user.deletedAt) throw new UnauthorizedException()
            req.user = user
            return true
        } catch {
            throw new UnauthorizedException()
        }
    }
}
