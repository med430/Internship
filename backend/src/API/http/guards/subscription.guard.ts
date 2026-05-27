import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import type { Request } from 'express'

import { SupabaseAuthBridge } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'
import { GetMySubscriptionQuery } from '../../../Application/Features/SubscriptionFeature/Queries/get-my-subscription.query'
import { SubscriptionType } from '../../../Domain/enums/subscription-type.enum'
import type { SubscriptionStatusResult } from '../../../Application/Features/SubscriptionFeature/Queries/handlers/get-my-subscription.handler'

/**
 * Guards any endpoint behind a PRO subscription check.
 *
 * Must run AFTER the request carries an Authorization: Bearer <token> header.
 * Because OnboardController does not use SupabaseAuthGuard (it supports both
 * authenticated and anonymous sessions), this guard performs its own token
 * verification via SupabaseAuthBridge before querying the subscription.
 *
 * Throws ForbiddenException (403) — not 401 — so the frontend can distinguish
 * "not logged in" from "logged in but needs to upgrade".
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {

    constructor(
        private readonly bridge: SupabaseAuthBridge,
        private readonly queryBus: QueryBus,
    ) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest<Request>()
        const token = this.extractBearer(req.header('authorization'))

        // No token at all → cannot determine subscription → deny
        if (!token) throw new ForbiddenException('PRO subscription required')

        const user = await this.bridge.resolve(token)
        if (!user) throw new ForbiddenException('PRO subscription required')

        const result: SubscriptionStatusResult = await this.queryBus.execute(
            new GetMySubscriptionQuery(user.id),
        )

        if (result.type !== SubscriptionType.PAID) {
            throw new ForbiddenException('PRO subscription required')
        }

        return true
    }

    private extractBearer(header?: string): string | null {
        if (!header) return null
        const [scheme, token] = header.split(' ', 2)
        return scheme?.toLowerCase() === 'bearer' && token?.trim() ? token.trim() : null
    }
}
