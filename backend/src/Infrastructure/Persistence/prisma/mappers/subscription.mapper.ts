import {IGenericMapper} from "./generic.mapper";
import {Subscription} from "../../../../Domain/entities/subscription.entity";
import { Subscription as SubscriptionDB } from "@prisma/client";

export class SubscriptionMapper implements IGenericMapper<Subscription, SubscriptionDB> {

    toDomain(entity: SubscriptionDB): Subscription {
        return new Subscription(
            entity.id,
            entity.studentId,
            entity.type,
        );
    }

    toPersistence(entity: Subscription): SubscriptionDB {
        return {
            id: entity.id,
            studentId: entity.studentProfileId,
            type: entity.type,
        };
    }
}