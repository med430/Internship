import {
    Controller,
    Post,
    Headers,
    Req,
    HttpCode,
    BadRequestException,
    Logger,
} from '@nestjs/common'
import type { RawBodyRequest } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import type { Request } from 'express'
import { StripeService } from '../../../Infrastructure/stripe/stripe.service'
import { UpgradeSubscriptionCommand } from '../../../Application/Features/SubscriptionFeature/Commands/upgrade-subscription.command'
import { CancelSubscriptionCommand } from '../../../Application/Features/SubscriptionFeature/Commands/cancel-subscription.command'

@Controller('webhooks')
export class StripeWebhookController {
    private readonly logger = new Logger(StripeWebhookController.name)

    constructor(
        private readonly stripeService: StripeService,
        private readonly commandBus: CommandBus,
    ) {}

    @Post('stripe')
    @HttpCode(200)
    async handleStripeWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        if (!signature) throw new BadRequestException('Missing stripe-signature header')

        let event: ReturnType<StripeService['constructEvent']>
        try {
            event = this.stripeService.constructEvent(req.rawBody!, signature)
        } catch (err) {
            this.logger.warn(`Webhook signature verification failed: ${(err as Error).message}`)
            throw new BadRequestException('Invalid webhook signature')
        }

        this.logger.log(`Stripe event received: ${event.type}`)

        switch (event.type) {

            case 'checkout.session.completed': {
                const session = event.data.object as {
                    metadata?: { userId?: string }
                    customer?: string | null
                    subscription?: string | null
                }
                const userId = session.metadata?.userId
                if (!userId) { this.logger.warn('checkout.session.completed missing userId in metadata'); break }
                await this.commandBus.execute(new UpgradeSubscriptionCommand(
                    userId,
                    session.customer ?? null,
                    session.subscription ?? null,
                ))
                this.logger.log(`Subscription upgraded for user ${userId}`)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as {
                    metadata?: { userId?: string }
                    customer?: string | null
                }
                const userId = subscription.metadata?.userId
                if (!userId) { this.logger.warn('customer.subscription.deleted missing userId in metadata'); break }
                await this.commandBus.execute(new CancelSubscriptionCommand(userId))
                this.logger.log(`Subscription cancelled for user ${userId}`)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as { customer?: string | null }
                this.logger.warn(`Payment failed for customer ${invoice.customer}`)
                break
            }

            default:
                this.logger.debug(`Unhandled event type: ${event.type}`)
        }

        return { received: true }
    }
}
