import { Offer } from '../../Domain/entities/offer.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IOfferRepository extends IGenericRepository<Offer, string> {
    abstract findByRecruiterProfileId(recruiterProfileId: string): Promise<Offer[]>

    // 🔥 update (important si ton save = create)
    abstract update(offer: Offer): Promise<Offer>

    // 🔥 soft delete
    abstract softDelete(id: string): Promise<void>
}