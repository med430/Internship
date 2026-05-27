import { OfferView } from '../../Domain/entities/offer-view.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IOfferViewRepository extends IGenericRepository<OfferView> {
    abstract findByStudent(studentId: string, limit?: number): Promise<OfferView[]>
    abstract findByOffer(offerId: string, limit?: number): Promise<OfferView[]>
    abstract countByStudentAndOffer(studentId: string, offerId: string): Promise<number>
    abstract countByStudent(studentId: string): Promise<Map<string, number>>
    abstract countByOffers(offerIds: string[]): Promise<Map<string, number>>
    abstract deleteOlderThan(cutoff: Date): Promise<number>
}
