// Side-effect middleware: when a Supabase JWT is present, ensure a matching User row exists in NeonDB.

import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { SupabaseAuthBridge } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'

@Injectable()
export class SupabaseSyncMiddleware implements NestMiddleware {

    constructor(private readonly bridge: SupabaseAuthBridge) {}

    // Peeks at the bearer token; if it verifies, the bridge auto-creates the User row. Never blocks or rewrites the request.
    async use(req: Request, _res: Response, next: NextFunction) {
        try {
            const token = this.extractBearer(req.header('authorization'))
            if (token) await this.bridge.resolve(token)
        } catch {
            // Swallow all errors: this middleware must never affect request flow.
        }
        next()
    }

    // Returns the raw token string from an `Authorization: Bearer ...` header, or null.
    private extractBearer(header?: string): string | null {
        if (!header) return null
        const [scheme, token] = header.split(' ', 2)
        return scheme?.toLowerCase() === 'bearer' && token?.trim() ? token.trim() : null
    }
}
