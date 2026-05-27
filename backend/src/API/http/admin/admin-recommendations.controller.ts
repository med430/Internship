// Admin-only endpoints for manually triggering and inspecting recommendation runs.

import { Body, Controller, ForbiddenException, Inject, Post, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { SupabaseUser } from '../decorators/supabase-user.decorator'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'
import { Role } from '../../../Domain/enums/role.enum'
import { ComputeRecommendationsCommand } from '../../../Application/Features/OfferRecommendationFeature/Commands/compute-recommendations.command'
import { IMlClient } from '../../../Application/Services/RecommendationService/ml-client.interface'
import { EventCleanupCronService } from '../../../Application/Services/RecommendationService/event-cleanup-cron.service'

@Controller('admin/recommendations')
@UseGuards(SupabaseAuthGuard)
export class AdminRecommendationsController {

    constructor(
        private readonly commandBus: CommandBus,
        @Inject(IMlClient) private readonly ml: IMlClient,
        private readonly cleanup: EventCleanupCronService,
    ) {}

    // Manually kicks off a full recompute. Optional studentUserId to rescore just one user.
    @Post('compute')
    async compute(@SupabaseUser() user: ResolvedUser, @Body() body: { studentUserId?: string }) {
        this.assertAdmin(user)
        return this.commandBus.execute(new ComputeRecommendationsCommand(body?.studentUserId))
    }

    // Probes the ML sidecar to check whether the AI half is reachable and what model it's serving.
    @Post('ml-health')
    async mlHealth(@SupabaseUser() user: ResolvedUser) {
        this.assertAdmin(user)
        const health = await this.ml.health()
        return { reachable: !!health, ...health }
    }

    // Manually runs the weekly retention cleanup so we can exercise the path without waiting for the cron.
    @Post('cleanup')
    async cleanupEvents(@SupabaseUser() user: ResolvedUser) {
        this.assertAdmin(user)
        return this.cleanup.run()
    }

    // Rejects callers whose resolved role is not ADMIN.
    private assertAdmin(user: ResolvedUser) {
        if (user.role !== Role.ADMIN) throw new ForbiddenException('admin only')
    }
}
