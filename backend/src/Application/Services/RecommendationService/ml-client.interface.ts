export interface MlOfferScore {
    offerId: string
    semanticScore: number
    cfScore: number
    finalMlScore: number
}

export interface MlStudentScore {
    studentId: string
    semanticScore: number
    cfScore: number
}

export interface ContentCandidate {
    offerId: string
    contentScore: number
}

export interface RecommendJobsRequest {
    studentId: string
    // Top-K offers by content score (the retrieval source), not the whole catalog. Python
    // fetches the student's stored vector from Qdrant by studentId — no studentText sent.
    contentCandidates: ContentCandidate[]
    limit: number
}

export interface RecommendUsersRequest {
    offerId: string
    offerText: string
    limit: number
}

export interface MlHealth {
    status: 'ok' | 'degraded' | 'down'
    modelVersion: string
    modelsLoaded: string[]
}

export abstract class IMlClient {
    abstract recommendJobs(req: RecommendJobsRequest): Promise<MlOfferScore[] | null>
    abstract recommendUsers(req: RecommendUsersRequest): Promise<MlStudentScore[] | null>
    abstract embed(texts: string[]): Promise<number[][] | null>
    abstract similarJobs(offerId: string, limit: number): Promise<{ offerId: string; similarity: number }[] | null>
    abstract feedback(event: { studentId: string; offerId: string; eventType: string; timestamp: Date }): Promise<void>
    abstract health(): Promise<MlHealth | null>
}