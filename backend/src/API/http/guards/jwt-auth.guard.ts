import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { IUserRepository } from '../../../Application/repositories/user.repository'
import { User } from '../../../Domain/entities/user.entity'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        @Inject(ConfigService)
        private readonly configService: ConfigService,
        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository,
    ) {
        super()
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (!this.isDevBypassEnabled()) {
            return (await super.canActivate(context)) as boolean
        }

        const request = context.switchToHttp().getRequest()
        request.user = await this.resolveDevBypassUser()
        return true
    }

    protected isDevBypassEnabled(): boolean {
        const nodeEnv = this.configService.get<string>('NODE_ENV')
        const bypassFlag = this.configService.get<string>('DEV_AUTH_BYPASS')

        return nodeEnv === 'development' && ['1', 'true', 'yes', 'on'].includes((bypassFlag ?? '').toLowerCase())
    }

    protected async resolveDevBypassUser(): Promise<User> {
        const configuredUserId = this.configService.get<string>('DEV_AUTH_BYPASS_USER_ID')
        if (configuredUserId) {
            const user = await this.userRepo.findById(configuredUserId)
            if (user && !user.deletedAt) return user
        }

        const configuredEmail = this.configService.get<string>('DEV_AUTH_BYPASS_USER_EMAIL')
        if (configuredEmail) {
            const user = await this.userRepo.findByEmail(configuredEmail)
            if (user && !user.deletedAt) return user
        }

        const configuredUsername = this.configService.get<string>('DEV_AUTH_BYPASS_USER_USERNAME')
        if (configuredUsername) {
            const user = await this.userRepo.findByUsername(configuredUsername)
            if (user && !user.deletedAt) return user
        }

        const users = await this.userRepo.findAll()
        const fallbackUser = users.find((user) => !user.deletedAt)
        if (fallbackUser) return fallbackUser

        throw new UnauthorizedException(
            'DEV_AUTH_BYPASS is enabled, but no local user could be resolved. Set DEV_AUTH_BYPASS_USER_ID, DEV_AUTH_BYPASS_USER_EMAIL, or DEV_AUTH_BYPASS_USER_USERNAME, or create a user first.',
        )
    }
}
