import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// ─── Shared types ──────────────────────────────────────────────────────────────

type GeneratedExperienceInput = {
    role?: string
    company?: string
    location?: string
    period?: string
    highlights?: string[] | string
}

type GeneratedEducationInput = {
    school?: string
    degree?: string
    period?: string
    details?: string[] | string
}

type GeneratedDocumentProfile = {
    name?: string
    email?: string
    phone?: string
    location?: string
    targetedRole?: string
    organization?: string
    summary?: string
    githubUrl?: string
    linkedinUrl?: string
    websiteUrl?: string
    skills?: string[] | string
    languages?: string[] | string
    certifications?: string[] | string
    experiences?: Array<GeneratedExperienceInput | string>
    education?: Array<GeneratedEducationInput | string>
}

type GeneratedJobOffer = {
    title?: string
    company?: string
    location?: string
    domain?: string
    type?: string
    workMode?: string
    description?: string
    requirements?: string[] | string
    benefits?: string[] | string
    recruiterName?: string
    compensation?: string[] | string
}

interface AiGeneratedContent {
    cv: {
        summary: string
        skillsHighlight: string
        experienceBullets: Record<number, string[]>
        educationNote: string
    }
    coverLetter: {
        opening: string
        whyFit: string
        whyCompany: string
        closing: string
    }
}

// ─── Text helpers ──────────────────────────────────────────────────────────────

function wrapText(
    text: string,
    font: { widthOfTextAtSize: (t: string, s: number) => number },
    size: number,
    maxWidth: number,
): string[] {
    if (!text) return ['']
    const words = text.split(/\s+/)
    const lines: string[] = []
    let current = ''
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word
        if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
            lines.push(current)
            current = word
        } else {
            current = candidate
        }
    }
    if (current) lines.push(current)
    return lines.length ? lines : ['']
}

function toText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : ''
}

function toList(value: unknown): string[] {
    if (!value) return []
    if (Array.isArray(value)) return value.map((i) => String(i).trim()).filter(Boolean)
    if (typeof value === 'string') return value.split(/[\n,;]+/).map((i) => i.trim()).filter(Boolean)
    return []
}

function normalizeProfile(profile: GeneratedDocumentProfile) {
    return {
        name: toText(profile.name),
        email: toText(profile.email),
        phone: toText(profile.phone),
        location: toText(profile.location),
        targetedRole: toText(profile.targetedRole),
        organization: toText(profile.organization),
        summary: toText(profile.summary),
        githubUrl: toText(profile.githubUrl),
        linkedinUrl: toText(profile.linkedinUrl),
        websiteUrl: toText(profile.websiteUrl),
        skills: toList(profile.skills),
        languages: toList(profile.languages),
        certifications: toList(profile.certifications),
        experiences: Array.isArray(profile.experiences) ? profile.experiences.map(normalizeExperience) : [],
        education: Array.isArray(profile.education) ? profile.education.map(normalizeEducation) : [],
    }
}

function normalizeOffer(offer: GeneratedJobOffer) {
    return {
        title: toText(offer.title),
        company: toText(offer.company),
        location: toText(offer.location),
        domain: toText(offer.domain),
        type: toText(offer.type),
        workMode: toText(offer.workMode),
        description: toText(offer.description),
        requirements: toList(offer.requirements),
        benefits: toList(offer.benefits),
        compensation: toList(offer.compensation),
        recruiterName: toText(offer.recruiterName),
    }
}

function normalizeExperience(experience: GeneratedExperienceInput | string) {
    if (typeof experience === 'string') return { role: experience, company: '', location: '', period: '', highlights: [] as string[] }
    return {
        role: toText(experience.role),
        company: toText(experience.company),
        location: toText(experience.location),
        period: toText(experience.period),
        highlights: toList(experience.highlights),
    }
}

function normalizeEducation(education: GeneratedEducationInput | string) {
    if (typeof education === 'string') return { school: education, degree: '', period: '', details: [] as string[] }
    return {
        school: toText(education.school),
        degree: toText(education.degree),
        period: toText(education.period),
        details: toList(education.details),
    }
}

// ─── AI helpers ────────────────────────────────────────────────────────────────

async function callGroqCompletion(prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: process.env.GROQ_LLM_MODEL || 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.65,
            max_tokens: 2000,
        }),
    })

    if (!response.ok) throw new Error(`Groq request failed with status ${response.status}`)
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    return payload.choices?.[0]?.message?.content ?? ''
}

function fallbackContent(
    profile: ReturnType<typeof normalizeProfile>,
    offer: ReturnType<typeof normalizeOffer>,
): AiGeneratedContent {
    const role = profile.targetedRole || offer.title
    const skills = profile.skills.slice(0, 3).join(', ') || 'relevant technologies'
    const bullets: Record<number, string[]> = {}
    profile.experiences.forEach((exp, i) => {
        bullets[i] = exp.highlights.length
            ? exp.highlights.slice(0, 3)
            : [`Contributed to projects at ${exp.company || 'organisation'}`, 'Collaborated with cross-functional teams to deliver results']
    })
    return {
        cv: {
            summary: `${profile.name || 'The candidate'} is a motivated ${role} with expertise in ${skills}. Proven ability to deliver results and contribute meaningfully to team goals. Seeking to bring this experience to ${offer.company}.`,
            skillsHighlight: `Strong foundation in ${skills}, directly aligned with the requirements of the ${offer.title} role.`,
            experienceBullets: bullets,
            educationNote: `Academic background provides solid theoretical grounding relevant to ${offer.domain || role}.`,
        },
        coverLetter: {
            opening: `I am writing to apply for the ${offer.title} position at ${offer.company}${offer.location ? ` in ${offer.location}` : ''}. Having followed ${offer.company}'s work in ${offer.domain || 'this space'}, I am excited by the opportunity to contribute my expertise.`,
            whyFit: `My background in ${skills} maps closely to your requirements. Across my career I have demonstrated the ability to ${profile.experiences[0]?.highlights[0] || 'deliver high-quality work'} and collaborate effectively.`,
            whyCompany: `${offer.company}'s focus on ${offer.domain || 'innovation'} aligns with my professional interests and long-term career goals.`,
            closing: `I would welcome the chance to discuss how I can contribute to your team. Thank you for considering my application.`,
        },
    }
}

async function buildAiContent(profileRaw: GeneratedDocumentProfile, offerRaw: GeneratedJobOffer): Promise<AiGeneratedContent> {
    const profile = normalizeProfile(profileRaw)
    const offer = normalizeOffer(offerRaw)
    const experienceCount = profile.experiences.length

    const prompt = `
You are a professional career coach and copywriter. Generate tailored, high-quality content for a CV and cover letter.

CANDIDATE:
- Name: ${profile.name || 'Candidate'}
- Targeted Role: ${profile.targetedRole || offer.title}
- Summary: ${profile.summary || 'Not provided'}
- Skills: ${profile.skills.join(', ') || 'Not provided'}
- Languages: ${profile.languages.join(', ') || 'Not provided'}
- Certifications: ${profile.certifications.join(', ') || 'None'}
- Experiences (${experienceCount}): ${JSON.stringify(profile.experiences.map((e) => ({ role: e.role, company: e.company, period: e.period, highlights: e.highlights.slice(0, 3) })))}
- Education: ${JSON.stringify(profile.education.map((e) => ({ school: e.school, degree: e.degree, period: e.period })))}

JOB OFFER:
- Title: ${offer.title}
- Company: ${offer.company}
- Location: ${offer.location || 'Not specified'}
- Domain: ${offer.domain || 'Not specified'}
- Work mode: ${offer.workMode || 'Not specified'}
- Requirements: ${offer.requirements.join(', ') || 'Not specified'}
- Description: ${offer.description ? offer.description.slice(0, 400) : 'Not provided'}

Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "cv": {
    "summary": "2-3 sentence professional summary tailored to this specific role and company.",
    "skillsHighlight": "One sentence framing the candidate's skill set in the context of this job.",
    "experienceBullets": { "0": ["Bullet 1", "Bullet 2", "Bullet 3"], "1": ["Bullet 1", "Bullet 2"] },
    "educationNote": "One sentence about how their education is relevant to this role."
  },
  "coverLetter": {
    "opening": "Engaging first paragraph (2-3 sentences). Mention the specific role and company.",
    "whyFit": "Second paragraph (2-3 sentences). Connect the candidate's skills and experience to the role requirements.",
    "whyCompany": "Third paragraph (1-2 sentences). Show enthusiasm for this specific company.",
    "closing": "Closing paragraph (2 sentences). Express interest in next steps."
  }
}

Rules:
- experienceBullets keys are 0-based indices for each experience entry (${experienceCount} total)
- Every bullet must start with a strong past-tense action verb
- Be concrete — reference actual skills, companies, and technologies from the profile
`

    try {
        const text = await callGroqCompletion(prompt)
        const clean = text.replace(/```json|```/g, '').trim()
        try { return JSON.parse(clean) as AiGeneratedContent }
        catch {
            const match = clean.match(/\{[\s\S]*\}/)
            if (match) return JSON.parse(match[0]) as AiGeneratedContent
            throw new Error('AI response was not valid JSON')
        }
    } catch {
        return fallbackContent(profile, offer)
    }
}

// ─── CV PDF — two-column layout ────────────────────────────────────────────────
//
//  LEFT sidebar (navy, ~195 px):
//    header block  →  name + target role
//    CONTACT       →  email / phone / location / linkedin / github / website
//    ABOUT ME      →  AI summary (or manual summary)
//    SKILLS        →  pill tags
//    LANGUAGES     →  bullet list
//    CERTIFICATIONS→  bullet list
//    EDUCATION     →  degree · school · period
//
//  RIGHT main area (~362 px):
//    headline      →  target role + accent bar + "prepared for" label
//    PROFESSIONAL EXPERIENCE  →  role / company / period / ai bullets
//
// ──────────────────────────────────────────────────────────────────────────────

export async function createCvPdf(
    profileRaw: GeneratedDocumentProfile,
    offerRaw: GeneratedJobOffer,
    aiContent?: AiGeneratedContent,
): Promise<Buffer> {
    const ai = (aiContent?.cv?.summary) ? aiContent : await buildAiContent(profileRaw, offerRaw).catch(() => null) ?? fallbackContent(normalizeProfile(profileRaw), normalizeOffer(offerRaw))
    const profile = normalizeProfile(profileRaw)
    const offer = normalizeOffer(offerRaw)

    const doc = await PDFDocument.create()
    const fontR = await doc.embedFont(StandardFonts.Helvetica)
    const fontB = await doc.embedFont(StandardFonts.HelveticaBold)
    const fontI = await doc.embedFont(StandardFonts.HelveticaOblique)

    // ── Layout ─────────────────────────────────────────────────────────────────
    const W = 595, H = 842
    const SB_W = 195, SB_PAD = 16
    const MX = SB_W + 22, MRX = W - 18, MW = MRX - MX
    const BOT = 30

    // ── Palette ────────────────────────────────────────────────────────────────
    const C_NAVY  = rgb(0.08, 0.14, 0.26)
    const C_DARK2 = rgb(0.05, 0.10, 0.20)
    const C_SKY   = rgb(0.30, 0.65, 0.88)
    const C_SKYDM = rgb(0.18, 0.43, 0.66)
    const C_WHITE = rgb(1, 1, 1)
    const C_SBTXT = rgb(0.84, 0.89, 0.96)
    const C_SBMUT = rgb(0.57, 0.64, 0.77)
    const C_DARK  = rgb(0.09, 0.10, 0.17)
    const C_GRAY  = rgb(0.41, 0.46, 0.53)
    const C_RULE  = rgb(0.85, 0.89, 0.94)
    const C_MACC  = rgb(0.09, 0.24, 0.46)
    const C_TAGBG = rgb(0.15, 0.23, 0.39)

    // ── Page factory ────────────────────────────────────────────────────────────
    const makePage = () => {
        const p = doc.addPage([W, H])
        p.drawRectangle({ x: 0, y: 0, width: SB_W, height: H, color: C_NAVY })
        p.drawLine({ start: { x: SB_W, y: H }, end: { x: SB_W, y: 0 }, thickness: 0.5, color: C_SKYDM })
        return p
    }

    let page = makePage()
    let sbY = H
    let mY = H

    const nextPage = () => {
        page = makePage()
        mY = H - 28
        sbY = H - 28
    }

    // ── Sidebar utilities ───────────────────────────────────────────────────────
    const sbSection = (title: string) => {
        sbY -= 9
        if (sbY < BOT) return
        page.drawText(title.toUpperCase(), { x: SB_PAD, y: sbY, size: 8, font: fontB, color: C_SKY })
        sbY -= 5
        page.drawLine({ start: { x: SB_PAD, y: sbY }, end: { x: SB_W - SB_PAD, y: sbY }, thickness: 0.4, color: C_SKYDM })
        sbY -= 9
    }

    const sbWrap = (text: string, size = 9.5, color = C_SBTXT, indent = 0) => {
        const lines = wrapText(text, fontR, size, SB_W - SB_PAD * 2 - indent)
        for (const line of lines) {
            if (sbY < BOT) return
            page.drawText(line, { x: SB_PAD + indent, y: sbY, size, font: fontR, color })
            sbY -= size + 3.5
        }
    }

    // ── Main utilities ──────────────────────────────────────────────────────────
    const mEnsure = (need: number) => { if (mY - need < BOT) nextPage() }

    const mSection = (title: string) => {
        mEnsure(26)
        page.drawText(title.toUpperCase(), { x: MX, y: mY, size: 9.5, font: fontB, color: C_MACC })
        mY -= 6
        page.drawLine({ start: { x: MX, y: mY }, end: { x: MRX, y: mY }, thickness: 0.5, color: C_RULE })
        mY -= 11
    }

    const mWrap = (text: string, size: number, font: typeof fontR, indent = 0, color = C_DARK) => {
        const lines = wrapText(text, font, size, MW - indent)
        for (const line of lines) {
            mEnsure(size + 4)
            page.drawText(line, { x: MX + indent, y: mY, size, font, color })
            mY -= size + 3
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SIDEBAR CONTENT
    // ══════════════════════════════════════════════════════════════════════════

    page.drawRectangle({ x: 0, y: H - 108, width: SB_W, height: 108, color: C_DARK2 })
    sbY = H - 18

    const nameParts = (profile.name || 'Candidate').trim().split(/\s+/)
    const fName = (nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0]).slice(0, 18)
    const lName = (nameParts.length > 1 ? nameParts[nameParts.length - 1] : '').slice(0, 18)

    page.drawText(fName, { x: SB_PAD, y: sbY, size: 14.5, font: fontR, color: C_WHITE })
    sbY -= 19
    if (lName) {
        page.drawText(lName, { x: SB_PAD, y: sbY, size: 14.5, font: fontB, color: C_WHITE })
        sbY -= 19
    }

    const roleStr = (profile.targetedRole || offer.title || '').slice(0, 27)
    if (roleStr) {
        page.drawText(roleStr, { x: SB_PAD, y: sbY, size: 8.5, font: fontI, color: C_SKY })
        sbY -= 12
    }

    page.drawLine({ start: { x: SB_PAD, y: sbY }, end: { x: SB_W - SB_PAD, y: sbY }, thickness: 2.5, color: C_SKY })
    sbY -= 16

    // Contact
    const contacts: Array<[string, string]> = []
    if (profile.email)      contacts.push(['Email', profile.email])
    if (profile.phone)      contacts.push(['Phone', profile.phone])
    if (profile.location)   contacts.push(['Location', profile.location])
    if (profile.linkedinUrl) contacts.push(['LinkedIn', profile.linkedinUrl])
    if (profile.githubUrl)   contacts.push(['GitHub', profile.githubUrl])
    if (profile.websiteUrl)  contacts.push(['Website', profile.websiteUrl])

    if (contacts.length) {
        sbSection('Contact')
        for (const [label, value] of contacts) {
            if (sbY < BOT) break
            page.drawText(label, { x: SB_PAD, y: sbY, size: 8, font: fontB, color: C_SKY })
            sbY -= 11
            sbWrap(value, 9, C_SBTXT)
            sbY -= 2
        }
    }

    // About Me
    const summaryText = ai?.cv?.summary || profile.summary
    if (summaryText) {
        sbSection('About Me')
        sbWrap(summaryText, 7.8, C_SBTXT)
    }

    // Skills
    if (profile.skills.length) {
        sbSection('Skills')
        for (const skill of profile.skills) {
            if (sbY < BOT) break
            const label = skill.length > 22 ? skill.slice(0, 21) + '…' : skill
            const tagW = Math.min(fontR.widthOfTextAtSize(label, 9) + 12, SB_W - SB_PAD * 2)
            page.drawRectangle({ x: SB_PAD, y: sbY - 2, width: tagW, height: 14, color: C_TAGBG })
            page.drawText(label, { x: SB_PAD + 6, y: sbY, size: 9, font: fontR, color: C_SBTXT })
            sbY -= 18
        }
    }

    // Languages
    if (profile.languages.length) {
        sbSection('Languages')
        for (const lang of profile.languages) {
            if (sbY < BOT) break
            page.drawText('•', { x: SB_PAD, y: sbY, size: 8, font: fontR, color: C_SKY })
            sbWrap(lang, 9.5, C_SBTXT, 8)
            sbY -= 1
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MAIN CONTENT
    // ══════════════════════════════════════════════════════════════════════════

    mY = H - 28

    // Headline
    const headline = (profile.targetedRole || offer.title || 'Professional Profile').slice(0, 40)
    page.drawText(headline, { x: MX, y: mY, size: 18, font: fontB, color: C_DARK })
    mY -= 22
    page.drawLine({ start: { x: MX, y: mY }, end: { x: MX + 52, y: mY }, thickness: 3, color: C_SKY })
    mY -= 14

    if (offer.title && offer.company) {
        page.drawText(`Prepared for: ${offer.title} at ${offer.company}`, { x: MX, y: mY, size: 8.5, font: fontI, color: C_GRAY })
        mY -= 16
    }

    // Professional Experience
    if (profile.experiences.length) {
        mSection('Professional Experience')
        for (const [index, exp] of profile.experiences.entries()) {
            const bulletsRaw = ai?.cv?.experienceBullets?.[index] ?? exp.highlights ?? []
            const bullets: string[] = Array.isArray(bulletsRaw) ? bulletsRaw : [bulletsRaw as string]

            mEnsure(32)
            page.drawText(exp.role || '', { x: MX, y: mY, size: 11.5, font: fontB, color: C_DARK })
            if (exp.period) {
                const pw = fontR.widthOfTextAtSize(exp.period, 9)
                page.drawText(exp.period, { x: MRX - pw, y: mY, size: 9, font: fontR, color: C_GRAY })
            }
            mY -= 15

            const companyLoc = [exp.company, exp.location].filter(Boolean).join('  ·  ')
            if (companyLoc) {
                mEnsure(14)
                page.drawText(companyLoc, { x: MX, y: mY, size: 10, font: fontI, color: C_GRAY })
                mY -= 14
            }

            for (const bullet of bullets) {
                const wrapped = wrapText(bullet, fontR, 10, MW - 18)
                for (let i = 0; i < wrapped.length; i++) {
                    mEnsure(14)
                    page.drawText((i === 0 ? '•  ' : '    ') + wrapped[i], { x: MX + 8, y: mY, size: 10, font: fontR, color: C_DARK })
                    mY -= 14
                }
            }
            mY -= 8
        }
    }

    // Education
    if (profile.education.length) {
        mSection('Education')
        for (const edu of profile.education) {
            mEnsure(28)
            page.drawText(edu.degree || '', { x: MX, y: mY, size: 11, font: fontB, color: C_DARK })
            if (edu.period) {
                const pw = fontR.widthOfTextAtSize(edu.period, 9)
                page.drawText(edu.period, { x: MRX - pw, y: mY, size: 9, font: fontR, color: C_GRAY })
            }
            mY -= 14
            mEnsure(13)
            page.drawText(edu.school || '', { x: MX, y: mY, size: 10, font: fontI, color: C_GRAY })
            mY -= 13
            if (edu.details.length) {
                mEnsure(13)
                const details = edu.details.slice(0, 2).join('  ·  ')
                page.drawText(details, { x: MX + 8, y: mY, size: 9, font: fontR, color: C_GRAY })
                mY -= 13
            }
            mY -= 6
        }
    }

    // Core Skills highlight (right column, below education)
    if (profile.skills.length && ai?.cv?.skillsHighlight) {
        mSection('Core Skills')
        mWrap(ai.cv.skillsHighlight, 10.5, fontI, 0, C_GRAY)
        mY -= 4
        const skillLine = profile.skills.slice(0, 12).join('  ·  ')
        mWrap(skillLine, 10, fontB, 0, C_MACC)
        mY -= 8
    }

    // Certifications (right, if any)
    if (profile.certifications.length) {
        mSection('Certifications')
        for (const cert of profile.certifications) {
            mEnsure(14)
            const wrapped = wrapText(cert, fontR, 10, MW - 16)
            for (let i = 0; i < wrapped.length; i++) {
                mEnsure(14)
                page.drawText((i === 0 ? '•  ' : '    ') + wrapped[i], { x: MX + 8, y: mY, size: 10, font: fontR, color: C_DARK })
                mY -= 14
            }
        }
        mY -= 4
    }

    return Buffer.from(await doc.save())
}

// ─── Cover Letter PDF — professional business letter ───────────────────────────
//
//  HEADER (full-width navy band):
//    left  → name (large bold) + targeted role (italic, sky)
//    right → email / phone / location (right-aligned)
//    bottom accent stripe (sky blue, 6px)
//
//  BODY (wide margins for formal letter feel):
//    date line (right-aligned)
//    recipient block (left) with left accent border
//    "Re:" subject banner (accent background)
//    "Dear..." salutation
//    4 paragraphs (AI: opening / whyFit / whyCompany / closing)
//    "Sincerely," + name + contact
//
//  FOOTER:
//    thin navy bar at bottom
//
// ──────────────────────────────────────────────────────────────────────────────

export async function createCoverLetterPdf(
    profileRaw: GeneratedDocumentProfile,
    offerRaw: GeneratedJobOffer,
    ai: AiGeneratedContent,
): Promise<Buffer> {
    const profile = normalizeProfile(profileRaw)
    const offer = normalizeOffer(offerRaw)

    const doc = await PDFDocument.create()
    const fontR = await doc.embedFont(StandardFonts.Helvetica)
    const fontB = await doc.embedFont(StandardFonts.HelveticaBold)
    const fontI = await doc.embedFont(StandardFonts.HelveticaOblique)

    // ── Layout ─────────────────────────────────────────────────────────────────
    const W = 595, H = 842
    const ML = 68, MR = 68
    const BODY_W = W - ML - MR
    const BOT = 48

    // ── Palette ────────────────────────────────────────────────────────────────
    const C_NAVY    = rgb(0.08, 0.14, 0.26)
    const C_NAVY2   = rgb(0.05, 0.09, 0.19)
    const C_SKY     = rgb(0.30, 0.65, 0.88)
    const C_SKYSOFT = rgb(0.91, 0.96, 1.00)
    const C_WHITE   = rgb(1, 1, 1)
    const C_DARK    = rgb(0.12, 0.14, 0.20)
    const C_GRAY    = rgb(0.42, 0.46, 0.53)
    const C_RULE    = rgb(0.85, 0.89, 0.95)

    const page = doc.addPage([W, H])
    let y = H

    // ── Paragraph helper ────────────────────────────────────────────────────────
    const drawParagraph = (text: string, size = 10.5, lineHeight = 16.5, color = C_DARK) => {
        if (!text) return
        const lines = wrapText(text, fontR, size, BODY_W)
        for (const line of lines) {
            page.drawText(line, { x: ML, y, size, font: fontR, color })
            y -= lineHeight
        }
        y -= 10
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HEADER BAND
    // ══════════════════════════════════════════════════════════════════════════

    const HDR_H = 98
    page.drawRectangle({ x: 0, y: H - HDR_H, width: W, height: HDR_H, color: C_NAVY })
    page.drawRectangle({ x: 0, y: H - HDR_H - 5, width: W, height: 5, color: C_SKY })

    // Name (left)
    page.drawText(profile.name || 'Applicant', { x: ML, y: H - 38, size: 22, font: fontB, color: C_WHITE })

    // Role (left, below name)
    const roleDisplay = profile.targetedRole || offer.title || ''
    if (roleDisplay) {
        page.drawText(roleDisplay.slice(0, 38), { x: ML, y: H - 58, size: 10, font: fontI, color: C_SKY })
    }

    // Contact block (right-aligned in header)
    const headerContact = [profile.email, profile.phone, profile.location].filter(Boolean)
    let hcY = H - 36
    for (const line of headerContact) {
        const lw = fontR.widthOfTextAtSize(line, 8.5)
        page.drawText(line, { x: W - MR - lw, y: hcY, size: 8.5, font: fontR, color: rgb(0.83, 0.90, 0.98) })
        hcY -= 14
    }

    // Links (right-aligned below contact)
    const links: string[] = []
    if (profile.linkedinUrl) links.push(profile.linkedinUrl)
    if (profile.githubUrl)   links.push(profile.githubUrl)
    if (links.length) {
        const linkLine = links.join('  |  ')
        const lw = fontR.widthOfTextAtSize(linkLine, 7.5)
        page.drawText(linkLine, { x: W - MR - lw, y: hcY, size: 7.5, font: fontR, color: rgb(0.60, 0.72, 0.86) })
    }

    y = H - HDR_H - 5 - 28

    // ══════════════════════════════════════════════════════════════════════════
    // DATE + RECIPIENT BLOCK
    // ══════════════════════════════════════════════════════════════════════════

    // Date (right-aligned)
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const dateW = fontR.widthOfTextAtSize(today, 9.5)
    page.drawText(today, { x: W - MR - dateW, y, size: 9.5, font: fontR, color: C_GRAY })
    y -= 28

    // Recipient block with left accent bar
    const recipientLines: string[] = []
    if (offer.recruiterName) recipientLines.push(offer.recruiterName)
    recipientLines.push(offer.company || '')
    if (offer.location) recipientLines.push(offer.location)

    const recipientH = recipientLines.filter(Boolean).length * 15 + 16
    page.drawRectangle({ x: ML - 2, y: y - recipientH + 12, width: BODY_W + 4, height: recipientH, color: C_SKYSOFT })
    page.drawLine({ start: { x: ML - 2, y: y + 12 }, end: { x: ML - 2, y: y - recipientH + 12 }, thickness: 2.5, color: C_SKY })

    for (const line of recipientLines) {
        if (!line) continue
        const isFirst = line === recipientLines[0]
        page.drawText(line, { x: ML + 8, y, size: isFirst ? 10 : 9.5, font: isFirst ? fontB : fontR, color: isFirst ? C_DARK : C_GRAY })
        y -= 15
    }
    y -= 14

    // ── Salutation ─────────────────────────────────────────────────────────────
    page.drawText(`Dear ${offer.recruiterName || 'Hiring Team'},`, { x: ML, y, size: 10.5, font: fontB, color: C_DARK })
    y -= 22

    // ── Re: subject banner ─────────────────────────────────────────────────────
    const subject = `Re: Application for ${offer.title}${offer.company ? ` — ${offer.company}` : ''}`
    page.drawRectangle({ x: ML, y: y - 4, width: BODY_W, height: 22, color: C_SKYSOFT })
    page.drawLine({ start: { x: ML, y: y - 4 }, end: { x: ML, y: y - 26 }, thickness: 2, color: C_SKY })
    page.drawText(subject.slice(0, 70), { x: ML + 10, y, size: 10, font: fontB, color: C_NAVY })
    y -= 32

    // ── Body paragraphs ────────────────────────────────────────────────────────
    drawParagraph(ai.coverLetter.opening, 10.5, 17, C_DARK)
    drawParagraph(ai.coverLetter.whyFit, 10.5, 17, C_DARK)
    drawParagraph(ai.coverLetter.whyCompany, 10.5, 17, C_DARK)
    drawParagraph(ai.coverLetter.closing, 10.5, 17, C_DARK)

    // ── Closing + signature ────────────────────────────────────────────────────
    y -= 6
    page.drawText('Sincerely,', { x: ML, y, size: 10.5, font: fontR, color: C_DARK })
    y -= 32

    page.drawText(profile.name || 'Applicant', { x: ML, y, size: 11, font: fontB, color: C_NAVY })
    y -= 15
    if (profile.phone) {
        page.drawText(profile.phone, { x: ML, y, size: 9, font: fontR, color: C_GRAY })
        y -= 13
    }
    if (profile.email) {
        page.drawText(profile.email, { x: ML, y, size: 9, font: fontR, color: C_GRAY })
        y -= 13
    }

    // ── Horizontal rule before footer ──────────────────────────────────────────
    const footerY = Math.min(y - 18, BOT + 10)
    page.drawLine({ start: { x: ML, y: footerY }, end: { x: W - MR, y: footerY }, thickness: 0.5, color: C_RULE })

    // ── Footer band ────────────────────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: 0, width: W, height: 6, color: C_NAVY2 })

    return Buffer.from(await doc.save())
}
