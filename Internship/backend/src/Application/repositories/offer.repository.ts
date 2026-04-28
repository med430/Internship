// Application/repositories/offer.repository.ts
import { Offer } from '../../Domain/entities/offer.entity'
import { IGenericRepository } from './generic.repository'

export interface IOfferRepository extends IGenericRepository<Offer> {
    findByRecruiter(recruiterId: string): Promise<Offer[]>
}

export const IOfferRepository = Symbol('IOfferRepository')