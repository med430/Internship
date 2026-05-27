import { Controller, Post, Get, UseGuards, Req, Inject } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { StripeService } from '../../../Infrastructure/stripe/stripe.service'
import { ISubscriptionRepository } from '../../../Application/repositories/subscription.repository'
import { IStudentProfileRepository } from '../../../Application/repositories/student-profile.repository'
import { GetMySubscriptionQuery } from '../../../Application/Features/SubscriptionFeature/Queries/get-my-subscription.query'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'
import type { SubscriptionStatusResult } from '../../../Application/Features/SubscriptionFeature/Queries/handlers/get-my-subscription.handler'

@Controller('subscription')
@UseGuards(SupabaseAuthGuard)
export class SubscriptionController {

    constructor(
        private readonly stripeService: StripeService,
        private readonly queryBus: QueryBus,
        @Inject(ISubscriptionRepository)
        private readonly subscriptionRepo: ISubscriptionRepository,
        @Inject(IStudentProfileRepository)
        private readonly profileRepo: IStudentProfileRepository,
    ) {}

    // Returns a Stripe Checkout URL — frontend redirects the user there.
    @Post('checkout')
    async createCheckout(@Req() req: { user: ResolvedUser }) {
        const { id: userId, email } = req.user
        const url = await this.stripeService.createCheckoutSession(userId, email)
        return { url }
    }

    // Returns a Stripe Customer Portal URL for managing / cancelling the subscription.
    @Post('portal')
    async createPortal(@Req() req: { user: ResolvedUser }) {
        const profile = await this.profileRepo.findByUserId(req.user.id)
        if (!profile) return { url: null, error: 'Profile not found' }

        const subscription = await this.subscriptionRepo.findByStudentProfileId(profile.id)
        if (!subscription?.stripeCustomerId) {
            return { url: null, error: 'No active Stripe subscription found' }
        }

        const url = await this.stripeService.createPortalSession(subscription.stripeCustomerId)
        return { url }
    }

    // Returns the current subscription status for the logged-in student (delegates to CQRS query).
    @Get('status')
    async getStatus(@Req() req: { user: ResolvedUser }): Promise<SubscriptionStatusResult> {
        return this.queryBus.execute(new GetMySubscriptionQuery(req.user.id))
    }
}
