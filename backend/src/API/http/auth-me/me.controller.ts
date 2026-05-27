// Exposes the resolved Supabase user (id, email, role from NeonDB) so the frontend can role-gate UI coherently with the backend.

import { Controller, Get, UseGuards } from '@nestjs/common'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { SupabaseUser } from '../decorators/supabase-user.decorator'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'

@Controller('auth')
@UseGuards(SupabaseAuthGuard)
export class MeController {

    @Get('me')
    me(@SupabaseUser() user: ResolvedUser) {
        return { id: user.id, email: user.email, role: user.role }
    }
}
