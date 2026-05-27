// Daily cron that recomputes RecommendationScore for every active student × offer pair.

import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { CommandBus } from '@nestjs/cqrs'
import { ComputeRecommendationsCommand } from '../../Features/OfferRecommendationFeature/Commands/compute-recommendations.command'

@Injectable()
export class RecommendationCronService {
    private readonly logger = new Logger(RecommendationCronService.name)

    constructor(private readonly commandBus: CommandBus) {}

    // Fires every day at 03:00 server time. Full rebuild — no studentId scope.
    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async runDailyRecompute(): Promise<void> {
        this.logger.log('daily recommendation recompute starting')
        try {
            const result = await this.commandBus.execute(new ComputeRecommendationsCommand())
            this.logger.log(`daily recommendation recompute done: ${JSON.stringify(result)}`)
        } catch (err) {
            this.logger.error('daily recommendation recompute failed', err as Error)
        }
    }
}
