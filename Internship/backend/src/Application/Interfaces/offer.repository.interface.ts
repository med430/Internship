import { Offer } from '../../Domain/entities/offer.entity'
import { IGenericRepository } from './generic.repository.interface'

export interface IOfferRepository extends IGenericRepository<Offer> {
    findByCreator(creatorId: string): Promise<Offer[]>
}