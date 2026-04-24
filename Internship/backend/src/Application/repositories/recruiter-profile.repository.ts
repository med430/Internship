export abstract class IRecruiterProfileRepository {

    abstract create(data: {
        id: string
        userId: string
    }): Promise<void>

    // 🔥 AJOUT ICI
    abstract findByUserId(userId: string): Promise<{
        id: string
        userId: string
    } | null>
}