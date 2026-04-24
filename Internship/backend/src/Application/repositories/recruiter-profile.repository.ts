import { RecruiterProfile } from "../../Domain/entities/recruiter-profile.entity";

export abstract class IRecruiterProfileRepository {

    abstract create(data: {
        id: string
        userId: string
        company: string // 🔥 AJOUT
    }): Promise<void>

    // 🔥 GraphQL (NE PAS TOUCHER)
    abstract findByUserId(userId: string): Promise<{
        id: string
        userId: string
    } | null>

    // 🔥 CQRS (NOUVEAU)
    abstract findDomainByUserId(userId: string): Promise<RecruiterProfile | null>

    abstract update(profile: RecruiterProfile): Promise<RecruiterProfile>
}