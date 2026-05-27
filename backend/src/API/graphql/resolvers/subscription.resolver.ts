import { Query, ResolveField, Parent, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { GqlAuthGuard } from '../guards/gql-auth.guard'
import { GqlCurrentUser } from '../decorators/gql-current-user.decorator'
import { GetMySubscriptionQuery } from '../../../Application/Features/SubscriptionFeature/Queries/get-my-subscription.query'
import { SubscriptionType } from '../../../Domain/enums/subscription-type.enum'
import type { SubscriptionStatusResult } from '../../../Application/Features/SubscriptionFeature/Queries/handlers/get-my-subscription.handler'

/**
 * Lightweight wrapper — exposes the current user's subscription status via GraphQL.
 * The heavy logic lives in GetMySubscriptionHandler (CQRS).
 *
 * Query:
 *   mySubscription { type isPro }
 */
@Resolver('SubscriptionStatus')
@UseGuards(GqlAuthGuard)
export class SubscriptionResolver {

    constructor(private readonly queryBus: QueryBus) {}

    @Query('mySubscription')
    async getMySubscription(
        @GqlCurrentUser() currentUser: { id: string },
    ): Promise<SubscriptionStatusResult & { isPro: boolean }> {
        const result: SubscriptionStatusResult = await this.queryBus.execute(
            new GetMySubscriptionQuery(currentUser.id),
        )
        return { ...result, isPro: result.type === SubscriptionType.PAID }
    }

    // Resolve the derived isPro field in case GraphQL requests it standalone
    @ResolveField('isPro')
    resolveIsPro(@Parent() parent: SubscriptionStatusResult): boolean {
        return parent.type === SubscriptionType.PAID
    }
}
