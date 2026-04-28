import { Application } from '../../Domain/entities/application.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IApplicationRepository
    extends IGenericRepository<Application> {

    abstract findByStudentAndOffer(
        studentId: string,
        offerId: string
    ): Promise<Application | null>

    abstract findByStudent(studentId: string): Promise<Application[]>

    abstract findByOffer(offerId: string): Promise<Application[]>

    abstract rejectAllExcept(
        offerId: string,
        acceptedId: string
    ): Promise<void>

    // 🔥 CHECK usage CV (pour delete sécurité)
    abstract existsByCvIdInApplications(
        cvId: string
    ): Promise<boolean>

    // 🔥 CHECK usage Letter
    abstract existsByCoverLetterIdInApplications(
        coverLetterId: string
    ): Promise<boolean>
}