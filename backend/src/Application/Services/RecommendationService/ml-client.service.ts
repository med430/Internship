import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
    IMlClient,
    MlHealth,
    MlOfferScore,
    MlStudentScore,
    RecommendJobsRequest,
    RecommendUsersRequest,
} from './ml-client.interface'

const TIMEOUT_MS = 5000

@Injectable()
export class MlClientService extends IMlClient {
    private readonly logger = new Logger(MlClientService.name)
    private readonly baseUrl: string
    private readonly token: string

    constructor(cfg: ConfigService) {
        super()
        this.baseUrl = cfg.get<string>('ML_SERVICE_URL') ?? 'http://localhost:8000'
        this.token   = cfg.get<string>('ML_INTERNAL_TOKEN') ?? 'dev-token'
    }

    async recommendJobs(req: RecommendJobsRequest): Promise<MlOfferScore[] | null> {
        const res = await this.post<{ offers: MlOfferScore[] }>('/recommend/jobs', req)
        return res?.offers ?? null
    }

    async recommendUsers(req: RecommendUsersRequest): Promise<MlStudentScore[] | null> {
        const res = await this.post<{ students: MlStudentScore[] }>('/recommend/users', req)
        return res?.students ?? null
    }

    async embed(texts: string[]): Promise<number[][] | null> {
        const res = await this.post<{ embeddings: number[][] }>('/embed', { texts })
        return res?.embeddings ?? null
    }

    async similarJobs(offerId: string, limit: number) {
        const res = await this.post<{ offers: { offerId: string; similarity: number }[] }>(
            '/similar/jobs',
            { offerId, limit },
        )
        return res?.offers ?? null
    }

    async feedback(event: { studentId: string; offerId: string; eventType: string; timestamp: Date }) {
        await this.post('/feedback', event)
    }

    async health(): Promise<MlHealth | null> {
        return this.get<MlHealth>('/health')
    }

    private async get<T>(path: string): Promise<T | null> {
        return this.request<T>('GET', path)
    }

    private async post<T>(path: string, body: unknown): Promise<T | null> {
        return this.request<T>('POST', path, body)
    }

    private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T | null> {
        for (let attempt = 0; attempt < 2; attempt++) {
            const ctrl = new AbortController()
            const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
            try {
                const res = await fetch(`${this.baseUrl}${path}`, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Internal-Token': this.token,
                    },
                    body: body !== undefined ? JSON.stringify(body) : undefined,
                    signal: ctrl.signal,
                })

                if (res.status >= 500 && attempt === 0) continue
                if (!res.ok) {
                    this.logger.warn(`ML ${method} ${path} → ${res.status}`)
                    return null
                }
                return await res.json() as T
            } catch (err) {
                if (attempt === 0) continue
                this.logger.warn(`ML ${method} ${path} failed: ${(err as Error).message}`)
                return null
            } finally {
                clearTimeout(timer)
            }
        }
        return null
    }
}
