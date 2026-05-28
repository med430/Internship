// Admin-only endpoints for manually triggering and inspecting recommendation runs.

import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { ComputeRecommendationsCommand } from '../../../Application/Features/OfferRecommendationFeature/Commands/compute-recommendations.command'
import { ComputeResult } from '../../../Application/Features/OfferRecommendationFeature/Commands/handlers/compute-recommendations.handler'
import { IMlClient } from '../../../Application/Services/RecommendationService/ml-client.interface'
import { EventCleanupCronService } from '../../../Application/Services/RecommendationService/event-cleanup-cron.service'

@Controller('admin/recommendations')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminRecommendationsController {

    constructor(
        private readonly commandBus: CommandBus,
        @Inject(IMlClient) private readonly ml: IMlClient,
        private readonly cleanup: EventCleanupCronService,
    ) {}

    @Post('compute')
    async compute(@Body() body: { studentUserId?: string }): Promise<ComputeResult> {
        return this.commandBus.execute<ComputeRecommendationsCommand, ComputeResult>(
            new ComputeRecommendationsCommand(body?.studentUserId, 'admin'),
        )
    }

    @Post('ml-health')
    async mlHealth() {
        const health = await this.ml.health()
        return { reachable: !!health, ...health }
    }

    // Manually runs the weekly retention cleanup so we can exercise the path without waiting for the cron.
    @Post('cleanup')
    async cleanupEvents() {
        return this.cleanup.run()
    }
}
