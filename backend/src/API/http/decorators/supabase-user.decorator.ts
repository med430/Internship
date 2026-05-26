// Param decorator that pulls the User resolved by SupabaseAuthGuard out of the request.

import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'

interface AuthedRequest extends Request { user?: ResolvedUser }

export const SupabaseUser = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): ResolvedUser | undefined => {
        return ctx.switchToHttp().getRequest<AuthedRequest>().user
    },
)
