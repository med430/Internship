// Stand-in for the Python sidecar before it ships. Returns null everywhere so the blender stays in Phase 0 (content-only,
// deterministic). The health call still reports "ok" so the admin panel reflects the mock as live.

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

    async recommendJobs(_req: RecommendJobsRequest): Promise<MlOfferScore[] | null> {
        return null
    }

    async recommendUsers(_req: RecommendUsersRequest): Promise<MlStudentScore[] | null> {
        return null
    }

    async embed(_texts: string[]): Promise<number[][] | null> {
        return null
    }

    async similarJobs(_offerId: string, _limit: number): Promise<{ offerId: string; similarity: number }[] | null> {
        return null
    }

    async feedback() {
        return
    }

    async health(): Promise<MlHealth> {
        return { status: 'ok', modelVersion: 'content-only', modelsLoaded: [] }
    }
}
