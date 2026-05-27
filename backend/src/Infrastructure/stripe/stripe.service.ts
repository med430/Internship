import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'

@Injectable()
export class StripeService {
    private readonly stripe: InstanceType<typeof Stripe>
    private readonly logger = new Logger(StripeService.name)

    readonly webhookSecret: string
    readonly proPriceId: string

    constructor(private readonly config: ConfigService) {
        this.stripe = new Stripe(config.get<string>('STRIPE_SECRET_KEY')!)
        this.webhookSecret = config.get<string>('STRIPE_WEBHOOK_SECRET')!
        this.proPriceId    = config.get<string>('STRIPE_PRO_PRICE_ID')!
    }

    async createCheckoutSession(userId: string, userEmail: string): Promise<string> {
        const session = await this.stripe.checkout.sessions.create({
            mode: 'subscription',
            customer_email: userEmail,
            line_items: [{ price: this.proPriceId, quantity: 1 }],
            metadata: { userId },
            success_url: `${this.config.get('NEXT_PUBLIC_SITE_URL')}/services/subscription/success`,
            cancel_url:  `${this.config.get('NEXT_PUBLIC_SITE_URL')}/services/subscription/cancel`,
        })
        return session.url!
    }

    async createPortalSession(stripeCustomerId: string): Promise<string> {
        const session = await this.stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${this.config.get('NEXT_PUBLIC_SITE_URL')}/services/dashboard`,
        })
        return session.url
    }

    constructEvent(rawBody: Buffer, signature: string) {
        return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret)
    }
}
