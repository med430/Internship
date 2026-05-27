import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { StripeService } from '../../../Infrastructure/stripe/stripe.service'
import { ISubscriptionRepository } from '../../../Application/repositories/subscription.repository'
import { IStudentProfileRepository } from '../../../Application/repositories/student-profile.repository'
import { Inject } from '@nestjs/common'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'

@Controller('subscription')
@UseGuards(SupabaseAuthGuard)
export class SubscriptionController {

    constructor(
        private readonly stripeService: StripeService,
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

    // Returns the current subscription status for the logged-in student.
    @Get('status')
    async getStatus(@Req() req: { user: ResolvedUser }) {
        const profile = await this.profileRepo.findByUserId(req.user.id)
        if (!profile) return { type: 'FREE' }

        const subscription = await this.subscriptionRepo.findByStudentProfileId(profile.id)
        return { type: subscription?.type ?? 'FREE' }
    }
}
