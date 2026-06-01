import { decodeCursor, encodeCursor } from './cursor'

describe('FeedCursor', () => {
    it('round-trips score, id and phase', () => {
        const encoded = encodeCursor({ score: 0.42, id: 'offer-1', phase: 'fallback' })
        expect(decodeCursor(encoded)).toEqual({ score: 0.42, id: 'offer-1', phase: 'fallback' })
    })

    it('defaults a phase-less cursor to ranked (backward compatible with old cursors)', () => {
        const legacy = Buffer.from(JSON.stringify({ score: 1, id: 'x' })).toString('base64url')
        expect(decodeCursor(legacy)).toEqual({ score: 1, id: 'x', phase: 'ranked' })
    })

    it('coerces an unknown phase value to ranked', () => {
        const weird = Buffer.from(JSON.stringify({ score: 1, id: 'x', phase: 'bogus' })).toString('base64url')
        expect(decodeCursor(weird)).toEqual({ score: 1, id: 'x', phase: 'ranked' })
    })

    it('returns null for missing or malformed cursors', () => {
        expect(decodeCursor(undefined)).toBeNull()
        expect(decodeCursor('not-base64-json!!')).toBeNull()
        expect(decodeCursor(Buffer.from(JSON.stringify({ id: 'x' })).toString('base64url'))).toBeNull()
    })
})
