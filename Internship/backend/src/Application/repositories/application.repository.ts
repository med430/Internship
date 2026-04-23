import { Application } from '../../Domain/entities/application.entity'

export abstract class IApplicationRepository {
    abstract findByStudentAndOffer(
        studentId: string,
        offerId: string
    ): Promise<Application | null>

    abstract save(app: Application): Promise<Application>
}