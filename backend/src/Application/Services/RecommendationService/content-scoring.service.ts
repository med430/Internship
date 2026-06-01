import { Injectable } from '@nestjs/common'
import { StudentProfile } from '../../../Domain/entities/student-profile.entity'
import { Offer } from '../../../Domain/entities/offer.entity'
import { SkillRequirement } from '../../../Domain/entities/skill-requirement'
import { SkillAssignment } from '../../../Domain/entities/skill-assignment.entity'
import { SkillLevel } from '../../../Domain/enums/skill-level.enum'
import { WorkMode } from '../../../Domain/enums/workMode'
import { ScoreBreakdown } from '../../../Domain/entities/recommendation-score.entity'

const SKILL_LEVEL_RANK: Record<SkillLevel, number> = {
    [SkillLevel.BEGINNER]:     1,
    [SkillLevel.INTERMEDIATE]: 2,
    [SkillLevel.ADVANCED]:     3,
    [SkillLevel.EXPERT]:       4,
}

const WORK_MODE_RANK: Record<WorkMode, number> = {
    [WorkMode.ONSITE]: 0,
    [WorkMode.HYBRID]: 1,
    [WorkMode.REMOTE]: 2,
}

const WEIGHTS = {
    skillMatch:        0.35,
    locationMatch:     0.20,
    domainMatch:       0.15,
    workModeMatch:     0.10,
    paidMatch:         0.05,
    availabilityScore: 0.05,
    languageMatch:     0.05,
    offerTypeMatch:    0.05,
} as const

@Injectable()
export class ContentScoringService {

    score(student: StudentProfile, offer: Offer): { score: number; breakdown: ScoreBreakdown } {
        const breakdown: ScoreBreakdown = {}
        const skillMatch = this.skillMatch(student.skills, offer.skillRequirements)
        const paidMatch = this.paidMatch(student.paidOnly, offer.isPaid)

        if (skillMatch !== undefined) breakdown.skillMatch = skillMatch
        breakdown.locationMatch     = this.locationMatch(student.preferredCities, offer.location, offer.workMode)
        breakdown.domainMatch       = this.domainMatch(student.preferredDomains, offer.domain)
        breakdown.workModeMatch     = this.workModeMatch(student.preferredWorkMode, offer.workMode)
        if (paidMatch !== undefined) breakdown.paidMatch = paidMatch
        breakdown.availabilityScore = this.availability(student.availableFrom, student.availableTo, offer.startDate, offer.endDate)
        breakdown.languageMatch     = this.languageMatch(student.languages, offer.languagesRequired)
        breakdown.offerTypeMatch    = this.offerTypeMatch(student.preferredOfferTypes, offer.type)

        const score = weightedScore(breakdown)
        return { score: clamp01(score), breakdown }
    }

    private skillMatch(have: SkillAssignment[], need: SkillRequirement[]): number | undefined {
        if (need.length === 0) return undefined

        const haveById = new Map<number, SkillLevel>()
        for (const a of have) haveById.set(a.skillId, a.level)

        let earned = 0
        let total = 0

        for (const req of need) {
            const weight = req.mandatory ? 2.0 : 1.0
            total += weight

            const myLevel = haveById.get(req.skill.id)
            if (myLevel === undefined) {
                continue
            }

            const diff = SKILL_LEVEL_RANK[myLevel] - SKILL_LEVEL_RANK[req.level]
            const credit = diff >= 0 ? 1.0 : diff === -1 ? 0.6 : 0.2
            earned += weight * credit
        }

        return total === 0 ? undefined : earned / total
    }

    private locationMatch(prefs: string[], offerLocation: string, mode: WorkMode): number {
        if (mode === WorkMode.REMOTE && prefs.map(p => p.toLowerCase()).includes('remote')) return 1.0
        if (prefs.length === 0) return 0.5

        const loc = offerLocation.toLowerCase()
        return prefs.some(p => loc.includes(p.toLowerCase()) || p.toLowerCase().includes(loc)) ? 1.0 : 0.0
    }

    private domainMatch(prefs: string[], offerDomain: string): number {
        if (prefs.length === 0) return 0.5
        const dom = offerDomain.toLowerCase()
        return prefs.some(p => dom.includes(p.toLowerCase()) || p.toLowerCase().includes(dom)) ? 1.0 : 0.0
    }

    private workModeMatch(pref: WorkMode | undefined, mode: WorkMode): number {
        if (pref === undefined) return 0.5
        const distance = Math.abs(WORK_MODE_RANK[pref] - WORK_MODE_RANK[mode])
        return distance === 0 ? 1.0 : distance === 1 ? 0.5 : 0.0
    }

    private paidMatch(paidOnly: boolean, offerIsPaid: boolean): number | undefined {
        if (!paidOnly) return undefined
        return offerIsPaid ? 1.0 : 0.0
    }

    private availability(
        from: Date | undefined,
        to: Date | undefined,
        offerStart: Date,
        offerEnd: Date,
    ): number {
        if (!from && !to) return 0.5

        const studentStart = from ? from.getTime() : -Infinity
        const studentEnd   = to   ? to.getTime()   : Infinity

        const overlapStart = Math.max(studentStart, offerStart.getTime())
        const overlapEnd   = Math.min(studentEnd, offerEnd.getTime())

        if (overlapStart >= overlapEnd) return 0.0

        const offerDuration = offerEnd.getTime() - offerStart.getTime()
        if (offerDuration <= 0) return 0.0

        const overlap = overlapEnd - overlapStart
        return clamp01(overlap / offerDuration)
    }

    private languageMatch(have: string[], need: string[]): number {
        if (need.length === 0) return 1.0
        if (have.length === 0) return 0.0
        const haveSet = new Set(have.map(l => l.toLowerCase()))
        const matched = need.filter(l => haveSet.has(l.toLowerCase())).length
        return matched / need.length
    }

    private offerTypeMatch(prefs: any[], offerType: any): number {
        if (prefs.length === 0) return 0.5
        return prefs.includes(offerType) ? 1.0 : 0.0
    }
}

type WeightedDimension = keyof typeof WEIGHTS

function weightedScore(breakdown: ScoreBreakdown): number {
    let earned = 0
    let totalWeight = 0

    for (const key of Object.keys(WEIGHTS) as WeightedDimension[]) {
        const value = breakdown[key]
        if (typeof value !== 'number' || !Number.isFinite(value)) continue

        earned += WEIGHTS[key] * clamp01(value)
        totalWeight += WEIGHTS[key]
    }

    return totalWeight === 0 ? 0 : earned / totalWeight
}

function clamp01(x: number): number {
    return x < 0 ? 0 : x > 1 ? 1 : x
}
