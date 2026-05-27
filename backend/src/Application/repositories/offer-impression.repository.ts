import { OfferImpression } from '../../Domain/entities/offer-impression.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IOfferImpressionRepository extends IGenericRepository<OfferImpression> {
    abstract createBatch(impressions: OfferImpression[]): Promise<number>
    abstract deleteOlderThan(cutoff: Date): Promise<number>
}
