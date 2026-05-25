import { OfferBookmark } from '../../Domain/entities/offer-bookmark.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IOfferBookmarkRepository extends IGenericRepository<OfferBookmark> {
    abstract findActiveByStudent(studentId: string): Promise<OfferBookmark[]>
    abstract findByStudentAndOffer(studentId: string, offerId: string): Promise<OfferBookmark | null>
    abstract softRemove(studentId: string, offerId: string): Promise<void>
}
