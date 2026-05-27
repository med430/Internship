import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { SupabaseAuthBridge } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'

@Injectable()
export class SseAuthGuard implements CanActivate {
    constructor(private readonly bridge: SupabaseAuthBridge) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const token = req.query.token as string | undefined

        if (!token) throw new UnauthorizedException()

        const user = await this.bridge.resolve(token)
        if (!user) throw new UnauthorizedException()

        req.user = user
        return true
    }
}