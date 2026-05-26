// Auth guard backed by the Supabase JWKS verifier; attaches the resolved User to the request.

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { SupabaseAuthBridge, ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'

interface AuthedRequest extends Request {
    user?: ResolvedUser
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {

    constructor(private readonly bridge: SupabaseAuthBridge) {}

    // Pulls the bearer token, asks the bridge to verify and resolve a User, throws if anything fails.
    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest<AuthedRequest>()
        const token = this.extractBearer(req.header('authorization'))
        const user = await this.bridge.resolve(token)
        if (!user) throw new UnauthorizedException('invalid or missing token')
        req.user = user
        return true
    }

    // Returns the raw token string from an `Authorization: Bearer ...` header, or null.
    private extractBearer(header?: string): string | null {
        if (!header) return null
        const [scheme, token] = header.split(' ', 2)
        return scheme?.toLowerCase() === 'bearer' && token?.trim() ? token.trim() : null
    }
}
