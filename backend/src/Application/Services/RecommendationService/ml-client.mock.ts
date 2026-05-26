import { Injectable } from '@nestjs/common'
import {
    IMlClient,
    MlHealth,
    MlOfferScore,
    MlStudentScore,
    RecommendJobsRequest,
    RecommendUsersRequest,
} from './ml-client.interface'

@Injectable()
export class MlClientMock extends IMlClient {

    async recommendJobs(req: RecommendJobsRequest): Promise<MlOfferScore[]> {
        const offerIds = Object.keys(req.contentScores)
        return offerIds.map(offerId => {
            const content = req.contentScores[offerId]
            const semantic = rand(0.5, 1.0)
            const cf = rand(0.5, 1.0)
            return {
                offerId,
                semanticScore: semantic,
                cfScore: cf,
                finalMlScore: 0.4 * content + 0.4 * semantic + 0.2 * cf,
            }
        })
    }

    async recommendUsers(req: RecommendUsersRequest): Promise<MlStudentScore[]> {
        return Array.from({ length: req.limit }, (_, i) => ({
            studentId: `mock-student-${i}`,
            semanticScore: rand(0.5, 1.0),
            cfScore: rand(0.5, 1.0),
        }))
    }

    async embed(texts: string[]): Promise<number[][]> {
        return texts.map(() => Array.from({ length: 1024 }, () => rand(-1, 1)))
    }

    async similarJobs(offerId: string, limit: number) {
        return Array.from({ length: limit }, (_, i) => ({
            offerId: `mock-similar-${i}`,
            similarity: rand(0.5, 1.0),
        }))
    }

    async feedback() {
        return
    }

    async health(): Promise<MlHealth> {
        return { status: 'ok', modelVersion: 'mock-v0', modelsLoaded: ['mock'] }
    }
}

function rand(min: number, max: number): number {
    return min + Math.random() * (max - min)
}
