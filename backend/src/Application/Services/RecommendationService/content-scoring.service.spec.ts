import { ContentScoringService } from './content-scoring.service'
import { Offer } from '../../../Domain/entities/offer.entity'
import { SkillAssignment } from '../../../Domain/entities/skill-assignment.entity'
import { SkillRequirement } from '../../../Domain/entities/skill-requirement'
import { Skill } from '../../../Domain/entities/skill.entity'
import { StudentProfile } from '../../../Domain/entities/student-profile.entity'
import { OfferType } from '../../../Domain/enums/offer-type.enum'
import { SkillLevel } from '../../../Domain/enums/skill-level.enum'
import { WorkMode } from '../../../Domain/enums/workMode'

describe('ContentScoringService', () => {
    const service = new ContentScoringService()

    it('does not claim a perfect skill match when an offer has no skill requirements', () => {
        const result = service.score(makeStudent(), makeOffer({ skillRequirements: [] }))

        expect(result.breakdown.skillMatch).toBeUndefined()
    })

    it('only scores paid preference when the student asked for paid-only offers', () => {
        const indifferent = service.score(makeStudent({ paidOnly: false }), makeOffer({ isPaid: false }))
        const paidOnlyUnpaidOffer = service.score(makeStudent({ paidOnly: true }), makeOffer({ isPaid: false }))
        const paidOnlyPaidOffer = service.score(makeStudent({ paidOnly: true }), makeOffer({ isPaid: true }))

        expect(indifferent.breakdown.paidMatch).toBeUndefined()
        expect(paidOnlyUnpaidOffer.breakdown.paidMatch).toBe(0)
        expect(paidOnlyPaidOffer.breakdown.paidMatch).toBe(1)
    })

    it('keeps partial credit when one required skill matches and another is missing', () => {
        const result = service.score(
            makeStudent({
                skills: [
                    new SkillAssignment('student-skill-1', 1, 'student-1', SkillLevel.INTERMEDIATE),
                ],
            }),
            makeOffer({
                skillRequirements: [
                    new SkillRequirement('req-1', new Skill(1, 'React'), SkillLevel.ADVANCED, true),
                    new SkillRequirement('req-2', new Skill(2, 'NestJS'), SkillLevel.INTERMEDIATE, true),
                ],
            }),
        )

        expect(result.breakdown.skillMatch).toBeGreaterThan(0)
        expect(result.breakdown.skillMatch).toBeLessThan(1)
    })

    it('scores neighboring work modes as half matches', () => {
        const result = service.score(
            makeStudent({ preferredWorkMode: WorkMode.REMOTE }),
            makeOffer({ workMode: WorkMode.HYBRID }),
        )

        expect(result.breakdown.workModeMatch).toBe(0.5)
    })

    it('scores opposite work modes as the lowest match', () => {
        const result = service.score(
            makeStudent({ preferredWorkMode: WorkMode.REMOTE }),
            makeOffer({ workMode: WorkMode.ONSITE }),
        )

        expect(result.breakdown.workModeMatch).toBe(0)
    })
})

function makeStudent(overrides: Partial<StudentProfile> = {}): StudentProfile {
    return Object.assign(
        new StudentProfile('student-profile-1', 'student-1'),
        {
            preferredCities: ['Tunis'],
            preferredDomains: ['Software'],
            preferredWorkMode: WorkMode.REMOTE,
            preferredOfferTypes: [OfferType.INTERNSHIP],
            languages: ['English'],
        },
        overrides,
    )
}

function makeOffer(overrides: Partial<Offer> = {}): Offer {
    return Object.assign(
        new Offer(
            'offer-1',
            'recruiter-profile-1',
            'Frontend Intern',
            'Build web interfaces.',
            'Acme',
            'Tunis',
            'Software',
            true,
            WorkMode.REMOTE,
            new Date('2026-06-01T00:00:00Z'),
            new Date('2026-09-01T00:00:00Z'),
            [],
            OfferType.INTERNSHIP,
            new Date('2026-05-01T00:00:00Z'),
            undefined,
            undefined,
            new Date('2026-06-15T00:00:00Z'),
            1,
            undefined,
            undefined,
            ['English'],
        ),
        overrides,
    )
}
