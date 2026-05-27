// Weekly cron that prunes behavioral-event tables past their retention windows.

import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { IOfferViewRepository } from '../../repositories/offer-view.repository'
import { IOfferImpressionRepository } from '../../repositories/offer-impression.repository'
import { ISearchQueryRepository } from '../../repositories/search-query.repository'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const VIEW_RETENTION_DAYS = 180        // 6 months
const IMPRESSION_RETENTION_DAYS = 90   // 3 months
const SEARCH_RETENTION_DAYS = 180      // 6 months

export interface CleanupResult {
    offerViewsDeleted: number
    offerImpressionsDeleted: number
    searchQueriesDeleted: number
    durationMs: number
}

@Injectable()
export class EventCleanupCronService {
    private readonly logger = new Logger(EventCleanupCronService.name)

    constructor(
        @Inject(IOfferViewRepository)       private readonly views:       IOfferViewRepository,
        @Inject(IOfferImpressionRepository) private readonly impressions: IOfferImpressionRepository,
        @Inject(ISearchQueryRepository)     private readonly searches:    ISearchQueryRepository,
    ) {}

    // Fires every Sunday at 04:00 server time. Bookmarks and profile views are kept forever — explicit intent signals.
    @Cron('0 4 * * 0')
    async runWeeklyCleanup(): Promise<void> {
        this.logger.log('weekly event cleanup starting')
        try {
            const result = await this.run()
            this.logger.log(`weekly event cleanup done: ${JSON.stringify(result)}`)
        } catch (err) {
            this.logger.error('weekly event cleanup failed', err as Error)
        }
    }

    // Same body the cron runs — exposed so admins can trigger cleanup without waiting for Sunday.
    async run(): Promise<CleanupResult> {
        const start = Date.now()
        const now = Date.now()
        const viewCutoff       = new Date(now - VIEW_RETENTION_DAYS * MS_PER_DAY)
        const impressionCutoff = new Date(now - IMPRESSION_RETENTION_DAYS * MS_PER_DAY)
        const searchCutoff     = new Date(now - SEARCH_RETENTION_DAYS * MS_PER_DAY)

        const [offerViewsDeleted, offerImpressionsDeleted, searchQueriesDeleted] = await Promise.all([
            this.views.deleteOlderThan(viewCutoff),
            this.impressions.deleteOlderThan(impressionCutoff),
            this.searches.deleteOlderThan(searchCutoff),
        ])

        return {
            offerViewsDeleted,
            offerImpressionsDeleted,
            searchQueriesDeleted,
            durationMs: Date.now() - start,
        }
    }
}
