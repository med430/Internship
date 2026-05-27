import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { StripeWebhookController } from './stripe-webhook.controller'
import { StripeService } from '../../../Infrastructure/stripe/stripe.service'

@Module({
    imports: [CqrsModule],
    controllers: [StripeWebhookController],
    providers: [StripeService],
    exports: [StripeService],
})
export class StripeWebhookModule {}
