// Request shapes for POST /events/track and /events/track/batch.

export type TrackEventType =
    | 'offer_view'
    | 'offer_bookmark'
    | 'offer_unbookmark'
    | 'offer_impression'
    | 'search_query'
    | 'profile_view'

export interface TrackEventData {
    offerId?: string
    studentProfileId?: string
    durationMs?: number
    source?: string
    position?: number
    query?: string
    filters?: Record<string, unknown>
    resultsCount?: number
}

export class TrackEventDto {
    eventType!: TrackEventType
    data!: TrackEventData
}

export class TrackEventBatchDto {
    events!: TrackEventDto[]
}
