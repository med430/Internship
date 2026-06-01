// Opaque base64 cursor for the infinite-scroll offer feed.

// `phase` lets one paginated stream cross the ranked → fallback boundary: the ranked
// (personally scored) head, then the explore-ranked tail of unscored offers. Absent = ranked.
export interface FeedCursor {
    score: number
    id: string
    phase?: 'ranked' | 'fallback'
}

// Pack the (score, id) we want to resume from into a base64 string the frontend treats as opaque.
export function encodeCursor(c: FeedCursor): string {
    return Buffer.from(JSON.stringify(c)).toString('base64url')
}

// Unpack the cursor from the frontend. Returns null if missing or malformed (caller treats as "first page").
export function decodeCursor(raw: string | undefined | null): FeedCursor | null {
    if (!raw) return null
    try {
        const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
        if (typeof parsed?.score !== 'number' || typeof parsed?.id !== 'string') return null
        const phase = parsed.phase === 'fallback' ? 'fallback' : 'ranked'
        return { score: parsed.score, id: parsed.id, phase }
    } catch {
        return null
    }
}