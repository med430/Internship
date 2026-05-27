import { IGenericRepository } from './generic.repository'
import { Subscription } from '../../Domain/entities/subscription.entity'

export abstract class ISubscriptionRepository extends IGenericRepository<Subscription, string> {
    abstract findByStudentProfileId(studentProfileId: string): Promise<Subscription | null>
}

export const ISubscriptionRepository = Symbol('ISubscriptionRepository')