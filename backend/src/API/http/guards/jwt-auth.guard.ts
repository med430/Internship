import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IUserRepository } from '../../../Application/repositories/user.repository'
import { User } from '../../../Domain/entities/user.entity'
import { SupabaseAuthBridge } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        @Inject(ConfigService)
        private readonly configService: ConfigService,
        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository,
        private readonly bridge: SupabaseAuthBridge,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.isDevBypassEnabled()) {
            const request = context.switchToHttp().getRequest()
            request.user = await this.resolveDevBypassUser()
            return true
        }

        const request = context.switchToHttp().getRequest()
        const auth = (request.headers.authorization as string | undefined) ?? ''
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null

        const resolved = await this.bridge.resolve(token)
        if (!resolved) return false

        request.user = { id: resolved.id, email: resolved.email, role: resolved.role }
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
