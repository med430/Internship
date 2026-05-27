import {IGenericMapper} from "./generic.mapper";
import {Subscription} from "../../../../Domain/entities/subscription.entity";
import { Subscription as SubscriptionDB } from "@prisma/client";
import {SubscriptionType} from "../../../../Domain/enums/subscription-type.enum";

export class SubscriptionMapper implements IGenericMapper<Subscription, SubscriptionDB> {

    toDomain(entity: SubscriptionDB): Subscription {
        return new Subscription(
            entity.id,
            entity.studentId,
            entity.type as SubscriptionType,
            entity.stripeCustomerId ?? null,
            entity.stripeSubscriptionId ?? null,
        )
    }

    toPersistence(entity: Subscription): SubscriptionDB {
        return {
            id:                   entity.id,
            studentId:            entity.studentProfileId,
            type:                 entity.type,
            stripeCustomerId:     entity.stripeCustomerId ?? null,
            stripeSubscriptionId: entity.stripeSubscriptionId ?? null,
        }
    }
}