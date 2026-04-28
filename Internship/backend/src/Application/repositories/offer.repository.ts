import { Offer } from '../../Domain/entities/offer.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IOfferRepository
    extends IGenericRepository<Offer> {

    abstract findByRecruiter(recruiterId: string): Promise<Offer[]>
}