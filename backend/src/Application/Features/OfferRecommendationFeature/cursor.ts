// Opaque base64 cursor for the infinite-scroll offer feed.

export interface FeedCursor {
    score: number
    id: string
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
        return parsed
    } catch {
        return null
    }
}