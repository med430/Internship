import {RecruiterProfile} from "../../Domain/entities/recruiter-profile.entity";

export abstract class IRecruiterProfileRepository {
    abstract create(data: {
        id: string
        userId: string
        company: string // 🔥 AJOUT
    }): Promise<void>

    abstract findByUserId(userId: string): Promise<RecruiterProfile | null>
}