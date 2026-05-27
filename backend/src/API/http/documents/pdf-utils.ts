import { PDFDocument, StandardFonts, rgb, RGB } from 'pdf-lib'

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

async function callGroqCompletion(prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
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

function toText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : ''
}

function toList(value: unknown): string[] {
    if (!value) return []
    if (Array.isArray(value)) return value.map((i) => String(i).trim()).filter(Boolean)
    if (typeof value === 'string') {
        return value.split(/[
,;]+/).map((i) => i.trim()).filter(Boolean)
    }
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
        experiences: Array.isArray(profile.experiences)
            ? profile.experiences.map((e) => normalizeExperience(e))
            : [],
        education: Array.isArray(profile.education)
            ? profile.education.map((e) => normalizeEducation(e))
            : [],
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
        recruiterName: toText(offer.recruiterName),
    }
}

function normalizeExperience(experience: GeneratedExperienceInput | string) {
    if (typeof experience === 'string') {
        return { role: experience, company: '', location: '', period: '', highlights: [] }
    }
    return {
        role: toText(experience.role),
        company: toText(experience.company),
        location: toText(experience.location),
        period: toText(experience.period),
        highlights: toList(experience.highlights),
    }
}

function normalizeEducation(education: GeneratedEducationInput | string) {
    if (typeof education === 'string') {
        return { school: education, degree: '', period: '', details: [] }
    }
    return {
        school: toText(education.school),
        degree: toText(education.degree),
        period: toText(education.period),
        details: toList(education.details),
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
- Experiences (${experienceCount}): ${JSON.stringify(
        profile.experiences.map((e) => ({ role: e.role, company: e.company, period: e.period, highlights: (e.highlights || []).slice(0,3) })),
    )}
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
    "summary": "2-3 sentence professional summary tailored to this specific role and company. Be specific, use the candidate's actual skills and experience.",
    "skillsHighlight": "One sentence that frames the candidate's skill set in the context of this job.",
    "experienceBullets": {
      "0": ["Action-oriented bullet 1 for first experience", "Bullet 2", "Bullet 3"],
      "1": ["Bullet 1 for second experience", "Bullet 2"]
    },
    "educationNote": "One sentence about how their education is relevant to this role."
  },
  "coverLetter": {
    "opening": "Engaging first paragraph (2-3 sentences). Mention the specific role and company. Show genuine interest.",
    "whyFit": "Second paragraph (2-3 sentences). Connect the candidate's specific skills and experience to the role requirements.",
    "whyCompany": "Third paragraph (1-2 sentences). Show knowledge of or enthusiasm for this specific company/domain.",
    "closing": "Closing paragraph (2 sentences). Express interest in next steps. Professional and warm."
  }
}

Rules:
- experienceBullets keys are 0-based numeric indices for each experience entry (${experienceCount} total)
- Every bullet must start with a strong past-tense action verb
- Be concrete — reference actual skills, companies, and technologies from the profile
- Keep the tone professional but human, not robotic
- If information is sparse, make reasonable inferences based on the role and domain
`

    try {
        const text = await callGroqCompletion(prompt)
        const clean = text.replace(/```json|```/g, '').trim()
        try {
            return JSON.parse(clean) as AiGeneratedContent
        } catch {
            const match = clean.match(/\{[\s\S]*\}/)
            if (match) return JSON.parse(match[0]) as AiGeneratedContent
            throw new Error('AI response was not valid JSON')
        }
    } catch (error) {
        // Fallback
        return fallbackContent(profile, offer)
    }
}

function fallbackContent(
    profile: ReturnType<typeof normalizeProfile>,
    offer: ReturnType<typeof normalizeOffer>,
): AiGeneratedContent {
    const role = profile.targetedRole || offer.title
    const skills = (profile.skills || []).slice(0, 3).join(', ') || 'relevant technologies'
    const bullets: Record<number, string[]> = {}
    profile.experiences.forEach((exp, i) => {
        bullets[i] = exp.highlights && exp.highlights.length
            ? (exp.highlights as string[]).slice(0, 3)
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
            whyFit: `My background in ${skills} maps closely to your requirements. Across my career I have demonstrated the ability to ${profile.experiences[0]?.highlights?.[0] || 'deliver high-quality work'} and collaborate effectively.`,
            whyCompany: `${offer.company}'s focus on ${offer.domain || 'innovation'} aligns with my professional interests and long-term career goals.`,
            closing: `I would welcome the chance to discuss how I can contribute to your team. Thank you for considering my application.`,
        },
    }
}

export async function createCvPdf(
    profile: GeneratedDocumentProfile,
    offer: GeneratedJobOffer,
    ai?: AiGeneratedContent,
): Promise<Buffer> {
    // If AI content not provided, generate it here by calling Groq
    if (!ai || !ai.cv || !ai.cv.summary) {
        try {
            ai = await buildAiContent(profile, offer)
        } catch {
            // ignore — downstream fallback will handle missing parts
        }
    }
    const pdf = await PDFDocument.create()
    const regular = await pdf.embedFont(StandardFonts.Helvetica)
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
    const oblique = await pdf.embedFont(StandardFonts.HelveticaOblique)

    const navy = rgb(0.08, 0.16, 0.34)
    const accent = rgb(0.16, 0.55, 0.86)
    const accentSoft = rgb(0.91, 0.96, 1)
    const dark = rgb(0.14, 0.17, 0.21)
    const muted = rgb(0.44, 0.48, 0.54)
    const ruleLine = rgb(0.85, 0.89, 0.95)
    const panel = rgb(0.97, 0.98, 1)
    const panelBorder = rgb(0.86, 0.9, 0.96)

    const W = 595
    const H = 842
    const ML = 52
    const MR = 52
    const BODY_W = W - ML - MR

    let page = pdf.addPage([W, H])
    let y = H - 48

    const ensureSpace = (needed: number) => {
        if (y - needed < 52) {
            page = pdf.addPage([W, H])
            y = H - 48
        }
    }

    const drawText = (
        text: string,
        opts: {
            x?: number
            size?: number
            font?: typeof bold
            color?: RGB
            maxWidth?: number
            lineHeight?: number
        } = {},
    ) => {
        const {
            x = ML,
            size = 10,
            font = regular,
            color = dark,
            maxWidth = BODY_W,
            lineHeight = size * 1.45,
        } = opts

        const lines = wrapText(text, font, size, maxWidth)
        ensureSpace(lines.length * lineHeight + 4)
        for (const line of lines) {
            page.drawText(line, { x, y, size, font, color })
            y -= lineHeight
        }
    }

    const drawRule = (color: RGB = ruleLine, thickness = 0.75) => {
        ensureSpace(6)
        page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness, color })
        y -= 6
    }

    const drawPill = (text: string, x: number, pillY: number, fill: RGB, textColor: RGB, widthPadding = 10) => {
        const pillWidth = regular.widthOfTextAtSize(text, 8.5) + widthPadding * 2
        page.drawRectangle({ x: x, y: pillY - 2, width: pillWidth, height: 18, color: fill })
        page.drawText(text, { x: x + widthPadding, y: pillY + 3, size: 8.5, font: bold, color: textColor })
        return pillWidth
    }

    const drawPanelHeading = (label: string) => {
        ensureSpace(26)
        page.drawRectangle({ x: ML, y: y - 2, width: BODY_W, height: 20, color: accentSoft })
        page.drawText(label.toUpperCase(), { x: ML + 8, y, size: 9, font: bold, color: accent })
        y -= 24
    }

    const drawSectionHeading = (label: string) => {
        drawPanelHeading(label)
        page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness: 1.25, color: accent })
        y -= 10
    }

    const drawCard = (height: number, fill: RGB = panel, borderColor: RGB = accent) => {
        page.drawRectangle({ x: ML, y: y - 4, width: BODY_W, height, color: fill })
        page.drawLine({ start: { x: ML, y: y - 4 }, end: { x: ML, y: y - 4 - height }, thickness: 2, color: borderColor })
    }

    const estimateCardHeight = (lineCount: number, lineHeight: number, padding = 18, minHeight = 32) => {
        return Math.max(minHeight, lineCount * lineHeight + padding)
    }

    // Header
    page.drawRectangle({ x: 0, y: H - 124, width: W, height: 124, color: navy })
    page.drawRectangle({ x: 0, y: H - 132, width: W, height: 8, color: accent })

    const nameSize = 26
    const nameText = profile.name || 'Candidate'
    page.drawText(nameText, { x: ML, y: H - 43, size: nameSize, font: bold, color: rgb(1, 1, 1) })

    const roleText = profile.targetedRole || offer.title || 'Targeted role'
    page.drawText(roleText, { x: ML, y: H - 69, size: 12, font: oblique, color: rgb(0.77, 0.89, 1) })

    const generatedFor = `Prepared for ${offer.title} at ${offer.company}`
    page.drawText(generatedFor, { x: ML, y: H - 90, size: 9.5, font: regular, color: rgb(0.83, 0.9, 0.98) })

    const contactParts = [profile.email, profile.phone, profile.location].filter(Boolean)
    const contactLine = contactParts.join('  ·  ')
    page.drawText(contactLine, { x: ML, y: H - 108, size: 8.5, font: regular, color: rgb(0.78, 0.87, 0.97) })

    y = H - 148

    const links = [profile.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : null, profile.githubUrl ? `GitHub: ${profile.githubUrl}` : null, profile.websiteUrl ? `Website: ${profile.websiteUrl}` : null].filter((l): l is string => Boolean(l))
    if (links.length) {
        page.drawText(links.join('   |   '), { x: ML, y, size: 8, font: regular, color: muted })
        y -= 16
    }

    drawRule()

    const factPills = [
        profile.location ? `Based in ${profile.location}` : null,
        profile.languages
            ? Array.isArray(profile.languages)
                ? profile.languages.slice(0, 2).join(' / ')
                : profile.languages
            : null,
        offer.domain ? offer.domain : null,
    ].filter((item): item is string => Boolean(item))
    if (factPills.length) {
        let pillX = ML
        ensureSpace(28)
        for (const pill of factPills) {
            const pillWidth = drawPill(pill, pillX, y, accentSoft, navy)
            pillX += pillWidth + 8
        }
        y -= 28
    }

    drawSectionHeading('Professional Summary')
    {
        const summaryLines = wrapText(ai?.cv?.summary || '', regular, 10, BODY_W - 18)
        const lineHeight = 15
        const panelHeight = Math.max(36, summaryLines.length * lineHeight + 18)
        drawCard(panelHeight)
        drawText(ai.cv.summary, { size: 10, color: dark, lineHeight, maxWidth: BODY_W - 18 })
        y -= panelHeight - 8
    }

    // Experience
    if (profile.experiences && profile.experiences.length) {
        drawSectionHeading('Experience')
        for (const [index, expRaw] of profile.experiences.entries()) {
            const exp = typeof expRaw === 'string' ? { role: expRaw, company: '', location: '', period: '', highlights: [] } : expRaw
            const roleLabel = [exp.role, exp.company].filter(Boolean).join('  —  ')
            const bullets: string[] = ai?.cv?.experienceBullets?.[index] ?? (exp.highlights || []).slice(0, 4)
            const roleLines = wrapText(roleLabel, bold, 11, BODY_W - 32)
            const locationLines = exp.location ? wrapText(exp.location, regular, 9, BODY_W - 32) : []
            const bulletLines = bullets.reduce((total, bullet) => total + wrapText(bullet, regular, 9.4, BODY_W - 40).length, 0)
            const cardHeight = estimateCardHeight(roleLines.length + locationLines.length + bulletLines, 14, 22, 62)
            ensureSpace(cardHeight + 12)
            drawCard(cardHeight)

            y -= 4

            page.drawText(roleLabel, { x: ML + 8, y, size: 11, font: bold, color: navy })

            if (exp.period) {
                const pw = oblique.widthOfTextAtSize(exp.period, 9)
                page.drawText(exp.period, { x: W - MR - pw - 8, y, size: 9, font: oblique, color: muted })
            }
            y -= 14

            if (exp.location) {
                page.drawText(exp.location, { x: ML + 8, y, size: 9, font: regular, color: muted })
                y -= 12
            }

            for (const bullet of bullets) {
                ensureSpace(18)
                page.drawRectangle({ x: ML + 8, y: y - 5, width: 5, height: 5, color: accent })
                drawText(bullet, { x: ML + 20, size: 9.4, color: dark, maxWidth: BODY_W - 22, lineHeight: 14 })
            }
            y -= 10
        }
    } else if (ai.cv.summary) {
        drawSectionHeading('Experience')
        page.drawRectangle({ x: ML, y: y - 4, width: BODY_W, height: 28, color: panel })
        drawText('No formal experience entries provided.', { size: 10, color: muted, maxWidth: BODY_W - 18 })
        y -= 4
    }

    // Education
    if (profile.education && profile.education.length) {
        drawSectionHeading('Education')
        const educationNoteLines = wrapText(ai?.cv?.educationNote || '', regular, 9.5, BODY_W - 18)
        const educationNoteHeight = estimateCardHeight(educationNoteLines.length, 14, 18, 34)
        drawCard(educationNoteHeight)
        drawText(ai.cv.educationNote, { size: 9.5, color: muted, lineHeight: 14, maxWidth: BODY_W - 18 })
        y -= 8

        for (const eduRaw of profile.education) {
            const edu = typeof eduRaw === 'string' ? { school: eduRaw, degree: '', period: '', details: [] } : eduRaw
            const degreeLabel = [edu.degree, edu.school].filter(Boolean).join('  —  ')
            const detailText = Array.isArray(edu.details) ? edu.details.slice(0, 2).join(' · ') : edu.details || ''
            const degreeLines = wrapText(degreeLabel, bold, 10.5, BODY_W - 32)
            const detailLines = detailText ? wrapText(detailText, regular, 9, BODY_W - 32) : []
            const cardHeight = estimateCardHeight(degreeLines.length + detailLines.length, 13, 20, 42)
            ensureSpace(cardHeight + 10)
            drawCard(cardHeight, rgb(0.98, 0.99, 1))
            page.drawText(degreeLabel, { x: ML + 8, y, size: 10.5, font: bold, color: navy })
            if (edu.period) {
                const pw = oblique.widthOfTextAtSize(edu.period, 9)
                page.drawText(edu.period, { x: W - MR - pw - 8, y, size: 9, font: oblique, color: muted })
            }
            y -= 14
            if (edu.details && edu.details.length) {
                const educationDetails = Array.isArray(edu.details) ? edu.details.slice(0, 2).join(' · ') : edu.details || ''
                drawText(educationDetails, { x: ML + 8, size: 9, color: muted, lineHeight: 13, maxWidth: BODY_W - 18 })
            }
            y -= 8
        }
    }

    // Skills
    const allSkills = (profile.skills && profile.skills.length ? profile.skills : [offer.domain || offer.title].filter(Boolean)) as string[]
    if (allSkills && allSkills.length) {
        drawSectionHeading('Core Skills')
        const skillRows: string[] = []
        let currentRow = ''
        for (const skill of allSkills) {
            const candidate = currentRow ? `${currentRow}   ·   ${skill}` : skill
            const w = bold.widthOfTextAtSize(candidate, 9.5)
            if (w > BODY_W && currentRow) {
                skillRows.push(currentRow)
                currentRow = skill
            } else {
                currentRow = candidate
            }
        }
        if (currentRow) skillRows.push(currentRow)

        const skillSummaryLines = wrapText(ai?.cv?.skillsHighlight || '', regular, 10, BODY_W - 18)
        const cardHeight = estimateCardHeight(skillSummaryLines.length + skillRows.length, 14, 22, 56)
        ensureSpace(cardHeight + 10)
        drawCard(cardHeight)
        drawText(ai.cv.skillsHighlight, { size: 10, color: muted, lineHeight: 14, maxWidth: BODY_W - 18 })
        y -= 6

        for (const row of skillRows) {
            ensureSpace(18)
            page.drawRectangle({ x: ML, y: y - 2, width: BODY_W, height: 18, color: rgb(0.94, 0.97, 1) })
            page.drawText(row, { x: ML + 8, y, size: 9.5, font: bold, color: navy })
            y -= 18
        }
        y -= 8
    }

    if (profile.certifications && profile.certifications.length) {
        drawSectionHeading('Certifications')
        for (const cert of profile.certifications) {
            ensureSpace(16)
            page.drawRectangle({ x: ML + 8, y: y - 5, width: 5, height: 5, color: accent })
            drawText(cert, { x: ML + 20, size: 9.5, color: dark, maxWidth: BODY_W - 22, lineHeight: 14 })
        }
        y -= 4
    }

    if (profile.languages && profile.languages.length) {
        drawSectionHeading('Languages')
        page.drawRectangle({ x: ML, y: y - 4, width: BODY_W, height: 22, color: accentSoft })
        const languageText = Array.isArray(profile.languages) ? profile.languages.join('   ·   ') : profile.languages || ''
        drawText(languageText, { x: ML + 8, size: 9.5, font: bold, color: navy })
    }

    ensureSpace(24)
    y -= 10
    drawRule(ruleLine, 0.5)
    const _offerLocationPart = offer.location ? `, ${offer.location}` : ''
    drawText(`Prepared for: ${offer.title} at ${offer.company}${_offerLocationPart}`, {
        size: 8,
        color: muted,
    })

    return Buffer.from(await pdf.save())
}

export async function createCoverLetterPdf(
    profile: GeneratedDocumentProfile,
    offer: GeneratedJobOffer,
    ai: AiGeneratedContent,
): Promise<Buffer> {
    const pdf = await PDFDocument.create()
    const regular = await pdf.embedFont(StandardFonts.Helvetica)
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
    const oblique = await pdf.embedFont(StandardFonts.HelveticaOblique)

    const navy = rgb(0.08, 0.16, 0.34)
    const accent = rgb(0.16, 0.55, 0.86)
    const accentSoft = rgb(0.92, 0.96, 1)
    const dark = rgb(0.15, 0.18, 0.22)
    const muted = rgb(0.44, 0.48, 0.54)
    const panel = rgb(0.98, 0.99, 1)
    const panelBorder = rgb(0.86, 0.9, 0.96)

    const W = 595
    const H = 842
    const ML = 72
    const MR = 72
    const BODY_W = W - ML - MR

    let page = pdf.addPage([W, H])
    let y = H - 52

    const ensureSpace = (needed: number) => {
        if (y - needed < 52) {
            page = pdf.addPage([W, H])
            y = H - 52
        }
    }

    const drawParagraph = (
        text: string,
        opts: { size?: number; font?: typeof bold; color?: RGB; lineHeight?: number } = {},
    ) => {
        const { size = 10.5, font = regular, color = dark, lineHeight = 16 } = opts
        const lines = wrapText(text, font, size, BODY_W)
        ensureSpace(lines.length * lineHeight + 16)
        for (const line of lines) {
            page.drawText(line, { x: ML, y, size, font, color })
            y -= lineHeight
        }
        y -= 10
    }

    page.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: navy })
    page.drawRectangle({ x: 0, y: H - 104, width: W, height: 8, color: accent })

    page.drawText(profile.name || 'Candidate', { x: ML, y: H - 42, size: 21, font: bold, color: rgb(1, 1, 1) })
        const roleTitle: string = profile.targetedRole || offer.title || 'Targeted role'
    page.drawText(roleTitle, { x: ML, y: H - 60, size: 10.5, font: oblique, color: rgb(0.82, 0.9, 1) })
    page.drawText(`${offer.title} · ${offer.company}`, { x: ML, y: H - 77, size: 9, font: regular, color: rgb(0.84, 0.9, 0.97) })

    const contactLines = [profile.email, profile.phone, profile.location].filter((line): line is string => Boolean(line))
    let contactY = H - 38
    for (const line of contactLines) {
        const lw = regular.widthOfTextAtSize(line, 9)
        page.drawText(line, { x: W - MR - lw, y: contactY, size: 9, font: regular, color: rgb(0.88, 0.93, 0.98) })
        contactY -= 13
    }

    y = H - 120
    page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness: 1, color: panelBorder })
    y -= 24

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    page.drawText(today, { x: ML, y, size: 9.5, font: regular, color: muted })
    y -= 28

    if (offer.recruiterName) {
        page.drawText(offer.recruiterName, { x: ML, y, size: 10.5, font: bold, color: dark })
        y -= 16
    }
    page.drawText(offer.company || '', { x: ML, y, size: 10, font: regular, color: dark })
    y -= 14
    if (offer.location) {
        page.drawText(offer.location, { x: ML, y, size: 10, font: regular, color: muted })
        y -= 14
    }
    y -= 20

    const recipientHeight = offer.location ? 52 : 38
    page.drawRectangle({ x: ML - 8, y: y - 4, width: BODY_W + 16, height: recipientHeight, color: panel })
    page.drawLine({ start: { x: ML - 8, y: y - 4 }, end: { x: ML - 8, y: y - 4 - recipientHeight }, thickness: 2, color: accent })
    y -= recipientHeight + 8

    page.drawText(`Dear ${offer.recruiterName || 'Hiring Team'},`, { x: ML + 8, y, size: 10.5, font: bold, color: dark })
    y -= 24

    page.drawRectangle({ x: ML, y: y - 4, width: BODY_W, height: 22, color: accentSoft })
    page.drawText(`Re: Application for ${offer.title}${offer.company ? ` — ${offer.company}` : ''}`, {
        x: ML + 8,
        y,
        font: bold,
        size: 10.5,
        color: navy,
    })
    y -= 28

    drawParagraph(ai.coverLetter.opening, { size: 11, lineHeight: 18, color: dark })
    drawParagraph(ai.coverLetter.whyFit, { size: 10.5, lineHeight: 16, color: dark })
    drawParagraph(ai.coverLetter.whyCompany, { size: 10.5, lineHeight: 16, color: dark })
    drawParagraph(ai.coverLetter.closing, { size: 10.5, lineHeight: 16, color: dark })

    y -= 8
    page.drawText('Sincerely,', { x: ML, y, size: 10.5, font: regular, color: dark })
    y -= 36
    page.drawText(profile.name || 'Applicant', { x: ML, y, size: 10.5, font: bold, color: navy })
    y -= 14
    if (profile.phone) {
        page.drawText(profile.phone, { x: ML, y, size: 9, font: regular, color: muted })
        y -= 13
    }
    if (profile.email) {
        page.drawText(profile.email, { x: ML, y, size: 9, font: regular, color: muted })
    }

    page.drawRectangle({ x: 0, y: 0, width: W, height: 6, color: navy })

    return Buffer.from(await pdf.save())
}
