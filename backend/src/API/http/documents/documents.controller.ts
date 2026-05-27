import {
    BadRequestException,
    Body,
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { PDFDocument, StandardFonts, rgb, RGB } from 'pdf-lib'
import { createCvPdf, createCoverLetterPdf } from './pdf-utils'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { CurrentUser } from '../decorators/current-user.decorator'
import { UploadCVCommand } from '../../../Application/Features/CvFeature/Commands/upload-cv.command'
import { UploadCoverLetterCommand } from '../../../Application/Features/CoverLetterFeature/Commands/upload-cover-letter.command'

// ─── Input Types ──────────────────────────────────────────────────────────────

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

type GenerateDocumentsRequest = {
    profile?: GeneratedDocumentProfile
    offer?: GeneratedJobOffer
}

// ─── AI-Generated Content Types ───────────────────────────────────────────────

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

// ─── Controller ───────────────────────────────────────────────────────────────

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class DocumentsController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('generate')
    async generate(@CurrentUser() user: { id: string }, @Body() body: GenerateDocumentsRequest) {
        const profile = this.normalizeProfile(body.profile ?? {})
        const offer = this.normalizeOffer(body.offer ?? {})

        if (!offer.title || !offer.company) {
            throw new BadRequestException('offer.title and offer.company are required')
        }

        // ── Generate AI content first ──────────────────────────────────────────
        const aiContent = await this.generateAiContent(profile, offer)

        // ── Build PDFs ────────────────────────────────────────────────────────
        const cvBuffer = await createCvPdf(profile, offer, aiContent)
        const coverLetterBuffer = await createCoverLetterPdf(profile, offer, aiContent)

        // ── Upload ────────────────────────────────────────────────────────────
        const safeSlug = this.slugify(`${profile.name || 'student'}-${offer.title}-${offer.company}`)
        const cvFile = this.toGeneratedFile(`${safeSlug}-cv.pdf`, cvBuffer)
        const coverLetterFile = this.toGeneratedFile(`${safeSlug}-cover-letter.pdf`, coverLetterBuffer)

        const cv = await this.commandBus.execute(new UploadCVCommand(user.id, cvFile))
        const coverLetter = await this.commandBus.execute(
            new UploadCoverLetterCommand(user.id, coverLetterFile),
        )

        return { success: true, cv, coverLetter }
    }

    // ─── AI Generation ─────────────────────────────────────────────────────────

    private async generateAiContent(
        profile: ReturnType<DocumentsController['normalizeProfile']>,
        offer: ReturnType<DocumentsController['normalizeOffer']>,
    ): Promise<AiGeneratedContent> {
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
            profile.experiences.map((e) => ({
                role: e.role,
                company: e.company,
                period: e.period,
                highlights: e.highlights.slice(0, 3),
            })),
        )}
- Education: ${JSON.stringify(
            profile.education.map((e) => ({ school: e.school, degree: e.degree, period: e.period })),
        )}

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
            const text = await this.callGroqCompletion(prompt)
            const clean = text.replace(/```json|```/g, '').trim()
            try {
                return JSON.parse(clean) as AiGeneratedContent
            } catch {
                const match = clean.match(/\{[\s\S]*\}/)
                if (match) return JSON.parse(match[0]) as AiGeneratedContent
                throw new Error('AI response was not valid JSON')
            }
        } catch (error) {
            // Graceful fallback — still produce a document, just without AI polish
            return this.fallbackContent(profile, offer)
        }
    }

    private async callGroqCompletion(prompt: string): Promise<string> {
        const apiKey = process.env.GROQ_API_KEY

        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not configured')
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.65,
                max_tokens: 2000,
            }),
        })

        if (!response.ok) {
            throw new Error(`Groq request failed with status ${response.status}`)
        }

        const payload = await response.json() as {
            choices?: Array<{ message?: { content?: string } }>
        }

        return payload.choices?.[0]?.message?.content ?? ''
    }

    private fallbackContent(
        profile: ReturnType<DocumentsController['normalizeProfile']>,
        offer: ReturnType<DocumentsController['normalizeOffer']>,
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



    // ─── Normalise helpers ─────────────────────────────────────────────────────

    private normalizeProfile(profile: GeneratedDocumentProfile) {
        return {
            name: this.toText(profile.name),
            email: this.toText(profile.email),
            phone: this.toText(profile.phone),
            location: this.toText(profile.location),
            targetedRole: this.toText(profile.targetedRole),
            organization: this.toText(profile.organization),
            summary: this.toText(profile.summary),
            githubUrl: this.toText(profile.githubUrl),
            linkedinUrl: this.toText(profile.linkedinUrl),
            websiteUrl: this.toText(profile.websiteUrl),
            skills: this.toList(profile.skills),
            languages: this.toList(profile.languages),
            certifications: this.toList(profile.certifications),
            experiences: Array.isArray(profile.experiences)
                ? profile.experiences.map((e) => this.normalizeExperience(e))
                : [],
            education: Array.isArray(profile.education)
                ? profile.education.map((e) => this.normalizeEducation(e))
                : [],
        }
    }

    private normalizeOffer(offer: GeneratedJobOffer) {
        return {
            title: this.toText(offer.title),
            company: this.toText(offer.company),
            location: this.toText(offer.location),
            domain: this.toText(offer.domain),
            type: this.toText(offer.type),
            workMode: this.toText(offer.workMode),
            description: this.toText(offer.description),
            requirements: this.toList(offer.requirements),
            benefits: this.toList(offer.benefits),
            recruiterName: this.toText(offer.recruiterName),
        }
    }

    private normalizeExperience(experience: GeneratedExperienceInput | string) {
        if (typeof experience === 'string') {
            return { role: experience, company: '', location: '', period: '', highlights: [] }
        }
        return {
            role: this.toText(experience.role),
            company: this.toText(experience.company),
            location: this.toText(experience.location),
            period: this.toText(experience.period),
            highlights: this.toList(experience.highlights),
        }
    }

    private normalizeEducation(education: GeneratedEducationInput | string) {
        if (typeof education === 'string') {
            return { school: education, degree: '', period: '', details: [] }
        }
        return {
            school: this.toText(education.school),
            degree: this.toText(education.degree),
            period: this.toText(education.period),
            details: this.toList(education.details),
        }
    }

    // ─── Text helpers ──────────────────────────────────────────────────────────

    /**
     * Wraps `text` to fit within `maxWidth` points using the given pdf-lib font.
     * This is metric-aware (uses actual glyph widths) unlike the old char-count approach.
     */
    private wrapText(
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

    private toGeneratedFile(filename: string, buffer: Buffer): Express.Multer.File {
        return {
            fieldname: 'file',
            originalname: filename,
            encoding: '7bit',
            mimetype: 'application/pdf',
            size: buffer.length,
            buffer,
            destination: '',
            filename,
            path: '',
            stream: undefined as never,
        }
    }

    private toText(value: unknown): string {
        return typeof value === 'string' ? value.trim() : ''
    }

    private toList(value: unknown): string[] {
        if (!value) return []
        if (Array.isArray(value)) return value.map((i) => String(i).trim()).filter(Boolean)
        if (typeof value === 'string') {
            return value.split(/[\n,;]+/).map((i) => i.trim()).filter(Boolean)
        }
        return []
    }

    private slugify(value: string): string {
        return (
            value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 80) || 'document'
        )
    }
}