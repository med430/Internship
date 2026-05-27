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

export interface RecommendJobsRequest {
    studentId: string
    studentText: string
    contentScores: Record<string, number>
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