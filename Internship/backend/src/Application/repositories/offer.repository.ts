import { Offer } from '../../Domain/entities/offer.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IOfferRepository extends IGenericRepository<Offer> {
    abstract findByCreator(creatorId: string): Promise<Offer[]>
}