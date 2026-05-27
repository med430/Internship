// Decides between the personalised offer feed and the anonymous demo fallback.

import { Injectable } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { GetRecommendedOffersQuery } from './Queries/get-recommended-offers.query'
import { RecommendedOffersPage } from './Queries/handlers/get-recommended-offers.handler'
import { SupabaseAuthBridge } from '../../Services/AuthBridge/supabase-auth-bridge.service'

export interface FeedRequest {
    bearerToken?: string | null
    limit?: number
    cursor?: string
    savedOnly?: boolean
    explore?: boolean
    exploreSeed?: number
}

export type FeedOutcome =
    | { kind: 'authenticated'; page: RecommendedOffersPage }
    | { kind: 'anonymous' }

@Injectable()
export class OfferFeedService {

    constructor(
        private readonly bridge: SupabaseAuthBridge,
        private readonly queryBus: QueryBus,
    ) {}

    // Resolves the Supabase user; if it succeeds we serve the ranked feed, otherwise we return "anonymous".
    async dispatch(req: FeedRequest): Promise<FeedOutcome> {
        const user = await this.bridge.resolve(req.bearerToken)
        if (!user) return { kind: 'anonymous' }

        const page = await this.queryBus.execute<GetRecommendedOffersQuery, RecommendedOffersPage>(
            new GetRecommendedOffersQuery(
                user.id,
                req.limit ?? 20,
                req.cursor,
                req.savedOnly === true,
                req.explore === true,
                req.exploreSeed ?? 0,
            ),
        )
        return { kind: 'authenticated', page }
    }
}
