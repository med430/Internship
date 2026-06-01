import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../Infrastructure/Persistence/prisma/prisma.service'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import pdfParse from 'pdf-parse'
import {
    InterviewAiService,
    InterviewContext,
    InterviewVoiceProfile,
} from '../../../Application/Services/InterviewService/interview-ai.service'
import { RecruiterMode } from '../../../Domain/enums/recruiter-mode.enum'

type PersonaRecord = {
    name: string
    role: string
    company: string
    years_experience: number
    style: string
    difficulty: string
    tone: string
    position: string
    voiceProfile: InterviewVoiceProfile
}

type InterviewTurn = {
    question: string
    answer: string
    score: number
    feedback: string
}

type InterviewState = {
    maxQuestions: number
    questions: string[]
    answers: string[]
    turns: InterviewTurn[]
}

type CvData = {
    name: string
    jobTitle?: string
    contact: { email?: string; phone?: string; location?: string; linkedin?: string }
    summary: string
    experience: Array<{ title: string; company: string; period: string; bullets: string[] }>
    education: Array<{ degree: string; school: string; period: string }>
    skills: string[]
    projects: Array<{ name: string; description: string; tech: string }>
}

type JobDocument = {
    job_id: string
    title: string
    company: string
    location: string
    description: string
    work_model?: string
    employment_type: string
    seniority_level: string
    job_function: string
    industries: string
    salary?: string
    company_logo_url?: string
    source: string
    source_url: string
    posted_date: string
    match_score?: number
}

type JobSearchFilters = {
    job_functions?: string[]
    job_types?: string[]
    work_models?: string[]
    experience_levels?: string[]
    locations?: string[]
    required_skills?: string[]
    posted_within_days?: number
}

type CareerBlueprint = {
    family: string
    mustHaveSkills: string[]
    strengthsFocus: string[]
    roadmapFocus: string[]
    transferables: string[]
}

type RemotiveJobRecord = {
    id: number
    url: string
    title: string
    company_name: string
    company_logo?: string
    company_logo_url?: string
    category?: string
    tags?: string[]
    job_type?: string
    publication_date?: string
    candidate_required_location?: string
    salary?: string
    description?: string
}

type ArbeitnowJobRecord = {
    slug: string
    company_name: string
    title: string
    description?: string
    remote?: boolean
    url: string
    tags?: string[]
    job_types?: string[]
    location?: string
    created_at?: number
}

type AcceptedJobFeature = 'cv-rewriter' | 'career-guide' | 'portfolio-builder'
type AcceptedJobOperation = 'questions' | 'rewrite' | 'generate'

type AcceptedJob = {
    job_id: string
    status: 'COMPLETED'
    feature: AcceptedJobFeature
    operation: AcceptedJobOperation
    created_at: string
    existing: boolean
    resource_id: string
    resource_type: string
    message: string
    progress: number
    phase: string
}

type PublicProfileUpdateInput = {
    name?: string | null
    email?: string | null
    location?: string | null
    birthday?: string | null
    targeted_role?: string | null
    organization?: string | null
    skills?: string[] | null
    education?: string[] | null
    experiences?: string[] | null
    achievements?: string[] | null
    github_url?: string | null
    linkedin_url?: string | null
    twitter_url?: string | null
    avatar_url?: string | null
    profile_completed?: boolean | null
    is_deactivated?: boolean | null
    deactivated_at?: string | null
    subscription?: 'Starter' | 'Achiever' | 'Expert' | null
    subscription_end_date?: string | null
}

const PERSONAS: Record<string, PersonaRecord> = {
    alex_chen: {
        name: 'Alex Chen',
        role: 'Senior Frontend Engineer',
        company: 'Vercel',
        years_experience: 8,
        style: 'Frontend architecture',
        difficulty: 'Intermediate',
        tone: 'Calm but exacting',
        position: 'Frontend Engineer',
        voiceProfile: {
            voiceId: 'iP95p4xoKVk53GoZ742B',
            settings: { stability: 0.47, similarityBoost: 0.84, style: 0.03, speed: 0.97, useSpeakerBoost: true },
        },
    },
    sarah_williams: {
        name: 'Sarah Williams',
        role: 'Engineering Manager',
        company: 'Stripe',
        years_experience: 10,
        style: 'Leadership and delivery',
        difficulty: 'Advanced',
        tone: 'Structured and thoughtful',
        position: 'Full Stack Engineer',
        voiceProfile: {
            voiceId: 'EXAVITQu4vr4xnSDxMaL',
            settings: { stability: 0.5, similarityBoost: 0.86, style: 0.02, speed: 0.96, useSpeakerBoost: true },
        },
    },
    ali_mahmoud: {
        name: 'Ali Mahmoud',
        role: 'Backend Lead',
        company: 'AWS',
        years_experience: 11,
        style: 'Distributed systems',
        difficulty: 'Advanced',
        tone: 'Technical and direct',
        position: 'Backend Engineer',
        voiceProfile: {
            voiceId: 'cjVigY5qzO86Huf0OWal',
            settings: { stability: 0.52, similarityBoost: 0.86, style: 0.01, speed: 0.99, useSpeakerBoost: true },
        },
    },
    aisha_obeid: {
        name: 'Aisha Obeid',
        role: 'Product Designer',
        company: 'Figma',
        years_experience: 7,
        style: 'UX reasoning',
        difficulty: 'Intermediate',
        tone: 'Warm and practical',
        position: 'UI/UX Designer',
        voiceProfile: {
            voiceId: 'pFZP5JQG7iQjIQuC4Bku',
            settings: { stability: 0.43, similarityBoost: 0.82, style: 0.05, speed: 0.97, useSpeakerBoost: true },
        },
    },
    jordan_lee: {
        name: 'Jordan Lee',
        role: 'Data Engineering Manager',
        company: 'Databricks',
        years_experience: 9,
        style: 'Data pipelines',
        difficulty: 'Intermediate',
        tone: 'Analytical',
        position: 'Data Engineer',
        voiceProfile: {
            voiceId: 'SAz9YHcvj6GT2YYXdXww',
            settings: { stability: 0.5, similarityBoost: 0.8, style: 0.01, speed: 0.98, useSpeakerBoost: true },
        },
    },
    harvey_specter: {
        name: 'Harvey Specter',
        role: 'Executive Recruiter',
        company: 'Pearson Hardman',
        years_experience: 15,
        style: 'High pressure hiring',
        difficulty: 'Advanced',
        tone: 'Sharp and challenging',
        position: 'Product Manager',
        voiceProfile: {
            voiceId: 'JBFqnCBsd6RMkjVDRZzb',
            settings: { stability: 0.56, similarityBoost: 0.84, style: 0.04, speed: 1.01, useSpeakerBoost: true },
        },
    },
    emma_wilson: {
        name: 'Emma Wilson',
        role: 'Talent Partner',
        company: 'Notion',
        years_experience: 6,
        style: 'Behavioral interviews',
        difficulty: 'Entry-level',
        tone: 'Supportive',
        position: 'Software Engineer',
        voiceProfile: {
            voiceId: 'hpp4J3VqNfWAUOO0d1Us',
            settings: { stability: 0.42, similarityBoost: 0.83, style: 0.04, speed: 0.96, useSpeakerBoost: true },
        },
    },
    lisa_anderson: {
        name: 'Lisa Anderson',
        role: 'Senior Recruiter',
        company: 'Shopify',
        years_experience: 8,
        style: 'Culture and communication',
        difficulty: 'Intermediate',
        tone: 'Friendly and candid',
        position: 'Frontend Engineer',
        voiceProfile: {
            voiceId: 'XrExE9yKIg1WjnnlVkGX',
            settings: { stability: 0.45, similarityBoost: 0.82, style: 0.04, speed: 0.98, useSpeakerBoost: true },
        },
    },
    michael_rodriguez: {
        name: 'Michael Rodriguez',
        role: 'DevOps Director',
        company: 'Cloudflare',
        years_experience: 12,
        style: 'Infrastructure and resilience',
        difficulty: 'Advanced',
        tone: 'Practical and fast-paced',
        position: 'DevOps Engineer',
        voiceProfile: {
            voiceId: 'nPczCjzI2devNBz1zQrb',
            settings: { stability: 0.53, similarityBoost: 0.84, style: 0.02, speed: 1, useSpeakerBoost: true },
        },
    },
    james_thompson: {
        name: 'James Thompson',
        role: 'ML Engineering Lead',
        company: 'OpenAI',
        years_experience: 10,
        style: 'Machine learning systems',
        difficulty: 'Advanced',
        tone: 'Curious and rigorous',
        position: 'ML Engineer',
        voiceProfile: {
            voiceId: 'onwK4e9ZLuTAKqWW03F9',
            settings: { stability: 0.5, similarityBoost: 0.85, style: 0.02, speed: 0.97, useSpeakerBoost: true },
        },
    },
}

const LIVE_JOB_CACHE_TTL_MS = 30 * 60 * 1000
const LIVE_JOB_FETCH_TIMEOUT_MS = 12000
const DEFAULT_JOB_SEARCH_TERMS = ['software engineer', 'frontend engineer', 'backend engineer']
const TECH_JOB_KEYWORDS = [
    'software engineer', 'frontend', 'backend', 'full stack', 'fullstack', 'developer',
    'devops', 'site reliability', 'platform engineer', 'cloud engineer', 'data engineer',
    'data scientist', 'machine learning', 'ml engineer', 'ai engineer', 'product manager',
    'product designer', 'ux designer', 'ui designer', 'qa engineer', 'automation',
    'security engineer', 'mobile developer', 'react', 'typescript', 'javascript', 'node',
    'python', 'aws', 'docker', 'kubernetes', 'n8n', 'api', 'supabase', 'postgres',
]
const EXCLUDED_JOB_KEYWORDS = [
    'academy', 'bootcamp', 'course', 'certification', 'training program',
    'weiterbildung', 'ausbildung', 'kurs', 'qualification program',
]

const SAMPLE_JOBS: JobDocument[] = [
    {
        job_id: 'job-001', title: 'frontend engineer', company: 'Vercel', location: 'berlin',
        description: 'Build polished React and Next.js interfaces, collaborate with design, and improve developer velocity.',
        employment_type: 'full_time', seniority_level: 'mid', job_function: 'Frontend Engineer',
        industries: 'Developer Tools', source: 'LinkedIn', source_url: 'https://example.com/jobs/frontend-vercel',
        posted_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
        job_id: 'job-002', title: 'backend engineer', company: 'Stripe', location: 'remote',
        description: 'Design APIs, build event-driven services, and improve reliability across payments infrastructure.',
        employment_type: 'full_time', seniority_level: 'mid', job_function: 'Backend Engineer',
        industries: 'Fintech', source: 'LinkedIn', source_url: 'https://example.com/jobs/backend-stripe',
        posted_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
        job_id: 'job-003', title: 'full stack engineer', company: 'Notion', location: 'hybrid',
        description: 'Ship product features end to end with TypeScript, Node.js, and React while partnering closely with product.',
        employment_type: 'full_time', seniority_level: 'entry', job_function: 'Full Stack Engineer',
        industries: 'Productivity', source: 'LinkedIn', source_url: 'https://example.com/jobs/fullstack-notion',
        posted_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
]

@Injectable()
export class OnboardService {
    private readonly liveJobsCache = new Map<string, { expiresAt: number; jobs: JobDocument[] }>()

    constructor(
        private readonly prisma: PrismaService,
        private readonly interviewAiService: InterviewAiService,
    ) {}

    async health() {
        return { status: 'ok', service: 'onboard', timestamp: new Date().toISOString() }
    }

    async extractText(file: Express.Multer.File | undefined) {
        if (!file) throw new Error('A file is required.')
        const text = await this.extractTextFromFile(file)
        return { text }
    }

    async getDashboard(sessionKey: string) {
        const profile = await this.getOrCreateProfile(sessionKey)
        const latestCv = await this.prisma.publicCv.findFirst({ where: { sessionKey }, orderBy: { createdAt: 'desc' } })
        const latestGuide = await this.prisma.publicCareerGuide.findFirst({ where: { sessionKey }, orderBy: { createdAt: 'desc' } })

        return {
            userName: profile.name || 'there',
            latestCV: latestCv ? {
                id: latestCv.id, job_title: latestCv.jobTitle, final_score: latestCv.finalScore,
                original_score: latestCv.originalScore, created_at: latestCv.createdAt.toISOString(),
            } : null,
            latestGuide: latestGuide ? {
                id: latestGuide.id, current_job: latestGuide.currentJob, target_job: latestGuide.targetJob,
                readiness_score: latestGuide.readinessScore, domain: latestGuide.domain,
                created_at: latestGuide.createdAt.toISOString(),
            } : null,
        }
    }

    async getProfile(sessionKey: string) {
        const profile = await this.getOrCreateProfile(sessionKey)
        return this.mapPublicProfile(profile)
    }

    async updateProfile(sessionKey: string, input: PublicProfileUpdateInput) {
        await this.getOrCreateProfile(sessionKey)
        const profile = await this.prisma.publicSessionProfile.update({
            where: { sessionKey },
            data: this.buildPublicProfileUpdateData(input),
        })
        return this.mapPublicProfile(profile)
    }

    async listPersonas() {
        return { personas: PERSONAS }
    }

    async filterJobs(filters: JobSearchFilters, resumeContent?: string, limit = 200) {
        const liveJobs = await this.loadLiveJobs(filters, resumeContent, limit)
        const filtered = liveJobs.filter((job) => this.matchesFilters(job, filters))
        const withScores = filtered
            .map((job) => ({ ...job, match_score: this.scoreJob(job, resumeContent ?? '') }))
            .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
            .slice(0, limit)

        return {
            success: true,
            jobs: withScores,
            total_found: withScores.length,
            filter_stats: {
                jobs_found: withScores.length,
                used_resume_matching: Boolean(resumeContent?.trim()),
                filters_applied: filters,
            },
            message: withScores.length > 0
                ? `Found ${withScores.length} live jobs matching your criteria.`
                : this.buildNoJobsMessage(Boolean(resumeContent?.trim())),
        }
    }

    async matchJobs(resumeContent: string, limit = 200) {
        const liveJobs = await this.loadLiveJobs({}, resumeContent, limit)
        const matches = liveJobs
            .map((job) => ({ ...job, match_score: this.scoreJob(job, resumeContent) }))
            .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
            .slice(0, limit)

        return {
            success: true,
            matches,
            total_found: matches.length,
            message: matches.length > 0 ? `Found ${matches.length} live matches.` : this.buildNoJobsMessage(true),
            profile_summary: {
                primary_titles: this.extractRoleKeywords(resumeContent).slice(0, 3),
                key_skills: this.extractSkillKeywords(resumeContent).slice(0, 5),
                experience_level: resumeContent.toLowerCase().includes('senior') ? 'senior'
                    : resumeContent.toLowerCase().includes('lead') ? 'mid' : 'entry',
            },
        }
    }

    async generateQuestions(sessionKey: string, cv: Express.Multer.File, jobDescriptions: Express.Multer.File[]): Promise<AcceptedJob> {
        const cvText = await this.extractTextFromFile(cv)
        const jobsTextParts = await Promise.all(jobDescriptions.map((file) => this.extractTextFromFile(file)))
        const jobsText = jobsTextParts.join('\n\n')
        const role = this.detectRole(jobsText || cvText || 'software engineer')

        // AI-generated questions based on actual CV + job description content
        const questions = await this.generateAiQuestions(cvText, jobsText, role)

        const session = await this.prisma.publicCvQuestionSession.create({
            data: {
                sessionKey, status: 'OPEN', questionsJson: questions,
                metadata: { question_count: 4, role, uploaded_jobs: jobDescriptions.length },
                cvText, jobsText, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        })

        return this.buildAcceptedJob({
            feature: 'cv-rewriter', operation: 'questions',
            resourceId: session.id, resourceType: 'cv_question_sessions',
            message: 'Questions generated successfully.',
        })
    }

    async getCvQuestionSession(sessionKey: string, id: string) {
        const session = await this.prisma.publicCvQuestionSession.findFirst({ where: { id, sessionKey } })
        if (!session) throw new Error('Question session not found.')
        return this.mapQuestionSession(session)
    }

    async listOpenCvQuestionSessions(sessionKey: string, limit = 50) {
        const sessions = await this.prisma.publicCvQuestionSession.findMany({
            where: { sessionKey, status: 'OPEN' }, orderBy: { createdAt: 'desc' }, take: limit,
        })
        return sessions.map((session) => this.mapQuestionSession(session))
    }

    async rewriteCv(
        sessionKey: string,
        questionSessionId: string,
        answers: Array<{ question: string; answer: string }>,
        baseUrl: string,
    ): Promise<AcceptedJob> {
        const session = await this.prisma.publicCvQuestionSession.findFirst({
            where: { id: questionSessionId, sessionKey },
        })
        if (!session) throw new Error('Question session not found.')

        const originalScore = this.computeBaselineScore(session.cvText)
        const answerBoost =
            Math.min(18, answers.reduce((sum, item) => sum + item.answer.trim().split(/\s+/).length, 0) / 35)
        const finalScore = Math.min(98, Math.round((originalScore + 8 + answerBoost) * 10) / 10)
        const role = this.detectRole(session.jobsText || session.cvText || 'software engineer')

        // AI-generated improvements based on actual answers
        const improvementNotes = await this.generateCvImprovements(
            session.cvText,
            role,
            answers,
        ).catch(() => [
            `Sharper role targeting for ${role} opportunities`,
            'Stronger impact statements with clearer outcomes',
            'Cleaner alignment between projects and job requirements',
            'More visible technical keywords for screening systems',
            'Improved professional summary and positioning',
        ])

        const enhancedText = [
            `Target Role: ${role}`,
            '',
            'Professional Summary',
            this.createProfessionalSummary(session.cvText, role),
            '',
            'Key Alignment Notes',
            ...answers.map((item, index) => `${index + 1}. ${item.answer.trim()}`),
            '',
            'Recommended Resume Improvements',
            ...improvementNotes.map((item, index) => `${index + 1}. ${item}`),
        ].join('\n')

        const cvData = await this.generateRewrittenCvContent(session.cvText, session.jobsText || '', role, answers).catch(() => null)

        const pdfBuffer = cvData
            ? await this.createFormattedCvPdf(cvData)
            : await this.createPdfDocument(`${role} CV Booster`, [
                  { heading: 'Professional Summary', lines: [this.createProfessionalSummary(session.cvText, role)] },
                  { heading: 'Answered Context', lines: answers.map((item) => `${item.question} ${item.answer}`) },
                  { heading: 'Improvements Applied', lines: improvementNotes },
              ])

        const pdfDataUri = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`

        const created = await this.prisma.publicCv.create({
            data: {
                sessionKey,
                questionSessionId,
                pdfUrl: pdfDataUri,
                originalScore,
                finalScore,
                jobTitle: role,
                jobsSummary: this.summarizeText(session.jobsText),
                reviewImprovements: improvementNotes,
                anonymizedCvText: enhancedText,
            },
        })

        await this.prisma.publicCvQuestionSession.update({
            where: { id: session.id },
            data: { status: 'COMPLETED' },
        })

        await this.refreshProfileFromCv(sessionKey, session.cvText, role)

        return this.buildAcceptedJob({
            feature: 'cv-rewriter',
            operation: 'rewrite',
            resourceId: created.id,
            resourceType: `${baseUrl}/download_cv/${created.id}`,
            message: 'CV rewritten successfully.',
        })
    }

    async listCvs(sessionKey: string, page: number, pageSize: number, baseUrl: string) {
        const [total, cvs] = await Promise.all([
            this.prisma.publicCv.count({ where: { sessionKey } }),
            this.prisma.publicCv.findMany({
                where: { sessionKey }, orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize, take: pageSize,
            }),
        ])
        return { cvs: cvs.map((cv) => this.mapCv(cv, baseUrl)), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    }

    async getCv(sessionKey: string, id: string, baseUrl: string) {
        const cv = await this.prisma.publicCv.findFirst({ where: { id, sessionKey } })
        if (!cv) throw new Error('CV not found.')
        return this.mapCv(cv, baseUrl)
    }

    async deleteCv(sessionKey: string, id: string) {
        const cv = await this.prisma.publicCv.findFirst({ where: { id, sessionKey } })
        if (!cv) throw new Error('CV not found.')
        await this.prisma.publicCv.delete({ where: { id } })
        return { success: true }
    }

    async downloadCv(sessionKey: string, id: string) {
        const cv = await this.prisma.publicCv.findFirst({ where: { id, sessionKey } })
        if (!cv) throw new Error('CV not found.')

        return {
            filename: `${cv.jobTitle.replace(/\s+/g, '_')}_cv.pdf`,
            url: cv.pdfUrl,
            base64: cv.pdfUrl.startsWith('data:') ? cv.pdfUrl.split(',')[1] : null,
        }
    }

    async getUserName(sessionKey: string) {
        const profile = await this.getOrCreateProfile(sessionKey)
        return { name: profile.name || 'there' }
    }

    async generateCareerGuide(
        sessionKey: string,
        cvFile: Express.Multer.File | undefined,
        cvText: string | undefined,
        currentJob: string,
        domain: string,
        targetJob?: string,
        profileData?: Record<string, unknown>,
    ): Promise<AcceptedJob> {
        const extractedCv = cvText?.trim()
            ? cvText.trim()
            : cvFile ? await this.extractTextFromFile(cvFile) : ''

        const targetRole = targetJob?.trim() || currentJob.trim()
        const cvSkills = this.extractSkillKeywords(extractedCv)
        const profileSignals = this.collectCareerGuideSignals(profileData)
        const roleBlueprint = this.buildCareerBlueprint(targetRole, domain, cvSkills, extractedCv)

        const prompt = this.buildCareerGuidePrompt({
            currentJob, domain, targetRole, roleBlueprint, extractedCv,
            profileData: profileSignals, cvSkills,
        })

        const insights = await this.generateCareerGuideInsights(prompt).catch(() => null)

        const currentStrengthsFallback = this.buildCareerStrengths(
            extractedCv, profileSignals, targetRole, roleBlueprint, cvSkills,
        )

        const currentStrengths = this.uniqueStrings(
            insights?.current_strengths?.length
                ? insights.current_strengths
                : currentStrengthsFallback,
        ).slice(0, 4)

        const skillsToLearn = this.uniqueStrings(
            insights?.skills_to_learn?.length
                ? insights.skills_to_learn
                : this.buildSkillGaps(domain, targetRole, cvSkills, roleBlueprint),
        ).slice(0, 4)

        const projectsToWorkOn = this.uniqueStrings(
            insights?.projects_to_work_on?.length
                ? insights.projects_to_work_on
                : this.buildProjects(domain, targetRole, cvSkills, roleBlueprint),
        ).slice(0, 4)

        const softSkillsToDevelop = this.uniqueStrings(
            insights?.soft_skills_to_develop?.length
                ? insights.soft_skills_to_develop
                : this.buildSoftSkillRecommendations(targetRole, domain),
        ).slice(0, 4)

        const careerRoadmap = this.uniqueStrings(
            insights?.career_roadmap?.length
                ? insights.career_roadmap
                : this.buildCareerRoadmap(targetRole, domain, cvSkills, roleBlueprint),
        ).slice(0, 5)

        const readinessScore = insights?.readiness_score != null
            ? Math.max(20, Math.min(99, Math.round(insights.readiness_score)))
            : this.resolveCareerGuideScore({
                extractedCv, targetRole, domain, currentStrengths,
                profileSignals, cvSkills, roleBlueprint,
            })

        const created = await this.prisma.publicCareerGuide.create({
            data: {
                sessionKey,
                currentStrengths: currentStrengths.length ? currentStrengths : currentStrengthsFallback,
                readinessScore, skillsToLearn, projectsToWorkOn, softSkillsToDevelop,
                careerRoadmap, domain, currentJob, targetJob: targetJob?.trim() || null,
            },
        })

        return this.buildAcceptedJob({
            feature: 'career-guide', operation: 'generate',
            resourceId: created.id, resourceType: 'career_guides',
            message: 'Career guide generated successfully.',
        })
    }

    async listCareerGuides(sessionKey: string, page: number, pageSize: number) {
        const [total, guides] = await Promise.all([
            this.prisma.publicCareerGuide.count({ where: { sessionKey } }),
            this.prisma.publicCareerGuide.findMany({
                where: { sessionKey }, orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize, take: pageSize,
            }),
        ])
        return { guides: guides.map((guide) => this.mapCareerGuide(guide)), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    }

    async getCareerGuide(sessionKey: string, id: string) {
        const guide = await this.prisma.publicCareerGuide.findFirst({ where: { id, sessionKey } })
        if (!guide) throw new Error('Career guide not found.')
        return this.mapCareerGuide(guide)
    }

    async getPortfolioOptions() {
        return {
            wireframes: ['classic', 'sidepanel', 'blog', 'hero', 'gallery'],
            themes: {
                predefined: ['professional', 'creative', 'minimal', 'tech', 'elegant', 'dynamic'],
                descriptions: {
                    professional: 'Clean and corporate style with neutral colors and clear hierarchy.',
                    creative: 'Energetic visuals, playful color, and expressive section transitions.',
                    minimal: 'Whitespace-first presentation with restrained typography.',
                    tech: 'Sharper contrast, terminal-inspired accents, and grid-heavy layout.',
                    elegant: 'Editorial balance with premium spacing and subtle motion.',
                    dynamic: 'Bold gradients, layered cards, and vivid presentation.',
                },
                custom_allowed: true,
            },
        }
    }

    async generatePortfolio(sessionKey: string, request: { wireframe: string; theme: string; cv?: Express.Multer.File; cvText?: string; personalInfo?: Record<string, unknown>; photoUrl?: string }): Promise<AcceptedJob> {
        const profile = await this.getOrCreateProfile(sessionKey)
        const cvText = request.cvText?.trim() ? request.cvText.trim() : request.cv ? await this.extractTextFromFile(request.cv) : ''
        const personalInfo = request.personalInfo ?? {}
        const html = this.buildPortfolioHtml({ profile, cvText, wireframe: request.wireframe, theme: request.theme, personalInfo, photoUrl: request.photoUrl })

        const created = await this.prisma.publicPortfolioGeneration.create({
            data: { sessionKey, wireframe: request.wireframe, theme: request.theme, html },
        })

        return this.buildAcceptedJob({
            feature: 'portfolio-builder', operation: 'generate',
            resourceId: created.id, resourceType: 'portfolio_generations',
            message: 'Portfolio generated successfully.',
        })
    }

    async listPortfolioGenerations(sessionKey: string, page: number, pageSize: number) {
        const [total, generations] = await Promise.all([
            this.prisma.publicPortfolioGeneration.count({ where: { sessionKey } }),
            this.prisma.publicPortfolioGeneration.findMany({
                where: { sessionKey }, orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize, take: pageSize,
            }),
        ])
        return {
            generations: generations.map((g) => ({ id: g.id, user_id: g.sessionKey, job_id: g.id, wireframe: g.wireframe, theme: g.theme, html: g.html, created_at: g.createdAt.toISOString() })),
            total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)),
        }
    }

    async getPortfolioGeneration(sessionKey: string, id: string) {
        const generation = await this.prisma.publicPortfolioGeneration.findFirst({ where: { id, sessionKey } })
        if (!generation) throw new Error('Portfolio generation not found.')
        return { id: generation.id, user_id: generation.sessionKey, job_id: generation.id, wireframe: generation.wireframe, theme: generation.theme, html: generation.html, created_at: generation.createdAt.toISOString() }
    }

    async startInterview(sessionKey: string, input: { personaKey?: string; questionCount?: number; company?: string; jobTitle?: string; jobDescription?: string }) {
        const personaKey = input.personaKey && PERSONAS[input.personaKey] ? input.personaKey : 'alex_chen'
        const persona = PERSONAS[personaKey]
        const maxQuestions = Math.max(2, Math.min(5, input.questionCount ?? 3))
        const recruiterMode = this.mapPersonaToRecruiterMode(persona)
        const context: InterviewContext = {
            company: input.company ?? persona.company,
            jobTitle: input.jobTitle ?? persona.position,
            jobDescription: input.jobDescription ?? `Interview practice for a ${input.jobTitle ?? persona.position} role.`,
        }
        const question = await this.generateOpeningQuestion(context, recruiterMode, persona, maxQuestions)
        const openingAudio = await this.maybeGenerateInterviewAudio(question, recruiterMode, persona.voiceProfile)

        const created = await this.prisma.publicInterview.create({
            data: {
                sessionKey, personaKey, status: 'IN_PROGRESS',
                interviewerName: persona.name, interviewerRole: persona.role,
                interviewStyle: persona.style, difficultyLevel: persona.difficulty,
                company: context.company, jobTitle: context.jobTitle,
                jobDescription: context.jobDescription, recruiterMode,
                data: { maxQuestions, questions: [question], answers: [], turns: [] },
            },
        })

        return { interviewId: created.id, questionText: question, questionIndex: 1, interviewerName: persona.name, personaKey, audioBase64: openingAudio?.audioBase64, audioMime: openingAudio?.audioMime }
    }

    async answerInterview(sessionKey: string, interviewId: string, input: { audio?: Express.Multer.File; text?: string }, baseUrl: string) {
        const interview = await this.prisma.publicInterview.findFirst({ where: { id: interviewId, sessionKey } })
        if (!interview) throw new Error('Interview not found.')

        const persona = PERSONAS[interview.personaKey] ?? PERSONAS.alex_chen
        const data = (interview.data ?? { maxQuestions: 3, questions: [], answers: [], turns: [] }) as InterviewState
        const currentQuestion = data.questions[data.questions.length - 1]
        const questionAsked = currentQuestion || this.buildInterviewQuestion(persona, data.answers.length + 1, data.maxQuestions, interview.jobTitle ?? persona.position)
        const recruiterMode = this.parseRecruiterMode(interview.recruiterMode, persona)
        const context = this.buildInterviewContext(interview, persona)
        const transcript = await this.resolveInterviewTranscript(input)
        const evaluation = await this.evaluateInterviewAnswer(context, recruiterMode, persona, questionAsked, transcript, data)
        const turn: InterviewTurn = { question: questionAsked, answer: transcript, score: evaluation.score, feedback: evaluation.feedback }

        data.answers.push(transcript)
        data.turns.push(turn)

        const done = data.turns.length >= data.maxQuestions || !evaluation.nextQuestion
        if (!done) {
            const nextQuestion = evaluation.nextQuestion ?? this.buildInterviewQuestion(persona, data.turns.length + 1, data.maxQuestions, interview.jobTitle ?? persona.position)
            data.questions.push(nextQuestion)
            const nextQuestionAudio = await this.maybeGenerateInterviewAudio(nextQuestion, recruiterMode, persona.voiceProfile)
            await this.prisma.publicInterview.update({ where: { id: interview.id }, data: { totalExchanges: data.turns.length, data, transcript: data.turns } })
            return { done: false, transcript, feedback: evaluation.feedback, questionText: nextQuestion, questionIndex: data.questions.length, audioBase64: nextQuestionAudio?.audioBase64, audioMime: nextQuestionAudio?.audioMime }
        }

        const report = await this.finalizeInterview(interview.id, data, persona, baseUrl)
        return { done: true, transcript, feedback: report.summary, summary: report.summary, score: report.overall_score, reportId: report.id }
    }

    async listInterviews(sessionKey: string, page: number, pageSize: number, baseUrl: string) {
        const [total, interviews] = await Promise.all([
            this.prisma.publicInterview.count({ where: { sessionKey, status: 'COMPLETED' } }),
            this.prisma.publicInterview.findMany({ where: { sessionKey, status: 'COMPLETED' }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
        ])
        return { interviews: interviews.map((item) => this.mapInterview(item, baseUrl)), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    }

    async getInterview(sessionKey: string, id: string, baseUrl: string) {
        const interview = await this.prisma.publicInterview.findFirst({ where: { id, sessionKey, status: 'COMPLETED' } })
        if (!interview) throw new Error('Interview not found.')
        return this.mapInterview(interview, baseUrl)
    }

    async deleteInterview(sessionKey: string, id: string) {
        const interview = await this.prisma.publicInterview.findFirst({ where: { id, sessionKey } })
        if (!interview) throw new Error('Interview not found.')
        await this.prisma.publicInterview.delete({ where: { id } })
        return { success: true }
    }

    async downloadInterviewPdf(sessionKey: string, id: string) {
        const interview = await this.prisma.publicInterview.findFirst({ where: { id, sessionKey, status: 'COMPLETED' } })
        if (!interview || !interview.pdfUrl) throw new Error('Interview PDF not found.')
        return { filename: `interview-report-${id}.pdf`, url: interview.pdfUrl }
    }

    // ─── Private: AI ──────────────────────────────────────────────────────────

    private async generateCvImprovements(
        cvText: string,
        role: string,
        answers: Array<{ question: string; answer: string }>,
    ): Promise<string[]> {
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) throw new Error('GROQ_API_KEY not configured')

        const answersBlock = answers
            .map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`)
            .join('\n\n')

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.GROQ_LLM_MODEL || 'llama-3.3-70b-versatile',
                temperature: 0.4,
                max_tokens: 600,
                messages: [
                    {
                        role: 'system',
                        content: [
                            'You are an expert CV coach.',
                            'Given a candidate CV and their answers to targeted questions, return a JSON object with key "improvements" containing an array of exactly 5 strings.',
                            'Each string is a specific, actionable improvement made to their CV based on their actual answers.',
                            'Be concrete — reference what they said. No generic advice.',
                            'Return only valid JSON, no other text.',
                        ].join(' '),
                    },
                    {
                        role: 'user',
                        content: `Target role: ${role}\n\nCV text:\n${cvText.slice(0, 2000)}\n\nCandidate answers:\n${answersBlock}`,
                    },
                ],
                response_format: { type: 'json_object' },
            }),
        })

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.error?.message || 'Groq failed')

        const content = payload?.choices?.[0]?.message?.content ?? ''
        const cleaned = content.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)

        // Handle { improvements: [...] } or { notes: [...] } or plain array
        const arr = Array.isArray(parsed)
            ? parsed
            : (parsed.improvements ?? parsed.notes ?? Object.values(parsed)[0])
        return this.ensureStringArray(arr).slice(0, 5)
    }

    private async generateAiQuestions(cvText: string, jobsText: string, role: string): Promise<Record<string, string>> {
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) return this.fallbackQuestions(role)

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.GROQ_LLM_MODEL || 'llama-3.3-70b-versatile',
                    temperature: 0.4,
                    max_tokens: 700,
                    messages: [
                        {
                            role: 'system',
                            content: [
                                'You are an expert CV coach. Based on the candidate\'s CV and the target job description, generate exactly 4 targeted questions.',
                                'Each question must: (1) reference a specific skill, technology, or requirement from the job description, (2) probe for a concrete achievement or experience that is absent or underdeveloped in the CV, (3) be answerable in 2-5 sentences and unlock richer bullet points.',
                                'Do NOT ask generic questions. Every question must be specific to this CV and this job.',
                                'Return ONLY valid JSON: {"question_1":"...","question_2":"...","question_3":"...","question_4":"..."}',
                            ].join(' '),
                        },
                        {
                            role: 'user',
                            content: `Target role: ${role}\n\nCV (extract):\n${cvText.slice(0, 2000)}\n\nJob description:\n${jobsText.slice(0, 1500)}`,
                        },
                    ],
                    response_format: { type: 'json_object' },
                }),
            })

            if (!response.ok) return this.fallbackQuestions(role)

            const payload = await response.json().catch(() => ({}))
            const content = payload?.choices?.[0]?.message?.content ?? '{}'
            const parsed = JSON.parse(content.replace(/```json|```/g, '').trim())

            if (parsed.question_1 && parsed.question_2 && parsed.question_3 && parsed.question_4) {
                return parsed
            }
        } catch { /* fall through */ }

        return this.fallbackQuestions(role)
    }

    private fallbackQuestions(role: string): Record<string, string> {
        return {
            question_1: `What project best demonstrates that you can succeed as a ${role}?`,
            question_2: `Which tools or technologies in your background map most directly to this ${role} role?`,
            question_3: `Tell us about a challenge you solved that shows ownership and strong results.`,
            question_4: `What specific contribution are you most proud of, and what was the measurable impact?`,
        }
    }

    private async generateRewrittenCvContent(
        cvText: string,
        jobsText: string,
        role: string,
        answers: Array<{ question: string; answer: string }>,
    ): Promise<CvData> {
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) throw new Error('GROQ_API_KEY not configured')

        const answersBlock = answers.map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`).join('\n\n')

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.GROQ_LLM_MODEL || 'llama-3.3-70b-versatile',
                temperature: 0.35,
                max_tokens: 3000,
                messages: [
                    {
                        role: 'system',
                        content: [
                            'You are a senior CV writer and career strategist. Your task is to REWRITE and ADAPT the candidate\'s CV — not reformat it.',
                            'You have three sources: the original CV (baseline facts), the job description (target requirements), and the candidate\'s own answers (new insights and achievements to integrate).',
                            'MANDATORY rules:',
                            '1. The professional summary MUST be rewritten from scratch to directly address the job description requirements using the candidate\'s real background.',
                            '2. Experience bullets MUST incorporate the specific achievements, metrics, and details revealed in the candidate answers — do not copy-paste original bullets.',
                            '3. Skills MUST be reordered so that skills explicitly required by the job description appear first.',
                            '4. Projects MUST be described in terms of relevance to the target role.',
                            '5. Use keywords and vocabulary from the job description for ATS alignment.',
                            '6. Preserve factual accuracy (dates, company names, degrees) but rewrite every narrative element.',
                            'Return ONLY a valid JSON object (no markdown, no extra text):',
                            '{"name":"full name","contact":{"email":"...","phone":"...","location":"city/country","linkedin":"url or empty"},"summary":"2-3 sentences targeting the job description directly","experience":[{"title":"job title","company":"company name","period":"date range","bullets":["strong action verb + achievement + metric","...","..."]}],"education":[{"degree":"degree name","school":"institution","period":"year range"}],"skills":["skill1","skill2"],"projects":[{"name":"project name","description":"impact-focused, relevant to target role","tech":"tech stack"}]}',
                        ].join(' '),
                    },
                    {
                        role: 'user',
                        content: [
                            `Target role: ${role}`,
                            '',
                            `Job description (requirements to match):\n${jobsText.slice(0, 1500)}`,
                            '',
                            `Original CV (facts to preserve, narrative to rewrite):\n${cvText.slice(0, 2500)}`,
                            '',
                            `Candidate answers (NEW content to integrate into bullets and summary):\n${answersBlock}`,
                        ].join('\n'),
                    },
                ],
                response_format: { type: 'json_object' },
            }),
        })

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.error?.message || 'Groq rewrite failed')

        const content = payload?.choices?.[0]?.message?.content ?? '{}'
        const cleaned = content.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)

        return {
            name: parsed.name || 'Candidate',
            jobTitle: role,
            contact: parsed.contact || {},
            summary: parsed.summary || '',
            experience: Array.isArray(parsed.experience) ? parsed.experience : [],
            education: Array.isArray(parsed.education) ? parsed.education : [],
            skills: Array.isArray(parsed.skills) ? parsed.skills : [],
            projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        }
    }

    private async generateCareerGuideInsights(prompt: string) {
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) throw new Error('GROQ_API_KEY is not configured')

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.GROQ_LLM_MODEL || 'llama-3.3-70b-versatile',
                temperature: 0.35,
                max_tokens: 2200,
                messages: [
                    {
                        role: 'system',
                        content: [
                            'You are a senior career coach and ATS analyst.',
                            'Analyze the candidate profile and CV against the target job and return JSON only.',
                            'The output must be highly specific to the provided CV, skills, and job — never generic.',
                            'ALL values must be plain strings or numbers — NO nested objects, NO sub-arrays.',
                            'Keys required: current_strengths, readiness_score, skills_to_learn, projects_to_work_on, soft_skills_to_develop, career_roadmap.',
                            'current_strengths: array of 3-4 plain strings, each citing a specific skill or achievement from the candidate profile.',
                            'readiness_score: single integer 0-100. Compare declared skills vs must-have skills. Be strict.',
                            'skills_to_learn: array of 3-5 plain strings naming specific missing skills/tools for the target job.',
                            'projects_to_work_on: array of 3-4 plain strings describing concrete project ideas to address skill gaps.',
                            'soft_skills_to_develop: array of 3-4 plain strings naming behavioral skills for the role.',
                            'career_roadmap: array of EXACTLY 5 plain strings. Each string must start with a timeline label (Week 1-2:, Month 1:, Month 2:, Month 3:, Month 4+:) followed by a concrete action. Example: "Week 1-2: Complete a React fundamentals course and build a todo app." Do NOT use objects.',
                        ].join(' '),
                    },
                    { role: 'user', content: prompt },
                ],
                response_format: { type: 'json_object' },
            }),
        })

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.error?.message || 'Groq career guide generation failed')
        const content = payload?.choices?.[0]?.message?.content
        if (!content) throw new Error('Empty Groq response')
        return this.parseCareerGuideInsights(content)
    }

    // ─── Private: helpers ─────────────────────────────────────────────────────

    private buildAcceptedJob(params: { feature: AcceptedJobFeature; operation: AcceptedJobOperation; resourceId: string; resourceType: string; message: string }): AcceptedJob {
        const now = new Date().toISOString()
        return { job_id: crypto.randomUUID(), status: 'COMPLETED', feature: params.feature, operation: params.operation, created_at: now, existing: false, resource_id: params.resourceId, resource_type: params.resourceType, message: params.message, progress: 100, phase: 'COMPLETED' }
    }

    private async getOrCreateProfile(sessionKey: string) {
        const existing = await this.prisma.publicSessionProfile.findUnique({ where: { sessionKey } })
        if (existing) return existing
        return this.prisma.publicSessionProfile.create({
            data: { sessionKey, name: '', email: null, location: null, birthDate: null, targetedRole: null, organization: null, skills: [], education: [], experiences: [], achievements: [], githubUrl: null, linkedinUrl: null, twitterUrl: null, avatarUrl: null, profileCompleted: false, isDeactivated: false, deactivatedAt: null, subscription: 'Starter', subscriptionEndDate: null },
        })
    }

    private async refreshProfileFromCv(sessionKey: string, cvText: string, role: string) {
        const profile = await this.getOrCreateProfile(sessionKey)
        const skills = this.extractSkillKeywords(cvText).slice(0, 6)
        await this.prisma.publicSessionProfile.update({ where: { sessionKey }, data: { targetedRole: role, skills: skills.length ? skills : profile.skills } })
    }

    private buildPublicProfileUpdateData(input: PublicProfileUpdateInput) {
        return {
            ...(input.name !== undefined ? { name: this.normalizeProfileName(input.name) } : {}),
            ...(input.email !== undefined ? { email: this.toNullableString(input.email) } : {}),
            ...(input.location !== undefined ? { location: this.toNullableString(input.location) } : {}),
            ...(input.birthday !== undefined ? { birthDate: this.toNullableDate(input.birthday) } : {}),
            ...(input.targeted_role !== undefined ? { targetedRole: this.toNullableString(input.targeted_role) } : {}),
            ...(input.organization !== undefined ? { organization: this.toNullableString(input.organization) } : {}),
            ...(input.skills !== undefined ? { skills: this.toStringList(input.skills) } : {}),
            ...(input.education !== undefined ? { education: this.toStringList(input.education) } : {}),
            ...(input.experiences !== undefined ? { experiences: this.toStringList(input.experiences) } : {}),
            ...(input.achievements !== undefined ? { achievements: this.toStringList(input.achievements) } : {}),
            ...(input.github_url !== undefined ? { githubUrl: this.toNullableString(input.github_url) } : {}),
            ...(input.linkedin_url !== undefined ? { linkedinUrl: this.toNullableString(input.linkedin_url) } : {}),
            ...(input.twitter_url !== undefined ? { twitterUrl: this.toNullableString(input.twitter_url) } : {}),
            ...(input.avatar_url !== undefined ? { avatarUrl: this.toNullableString(input.avatar_url) } : {}),
            ...(input.profile_completed !== undefined ? { profileCompleted: Boolean(input.profile_completed) } : {}),
            ...(input.is_deactivated !== undefined ? { isDeactivated: Boolean(input.is_deactivated) } : {}),
            ...(input.deactivated_at !== undefined ? { deactivatedAt: this.toNullableDate(input.deactivated_at) } : {}),
            ...(input.subscription !== undefined ? { subscription: input.subscription || 'Starter' } : {}),
            ...(input.subscription_end_date !== undefined ? { subscriptionEndDate: this.toNullableDate(input.subscription_end_date) } : {}),
        }
    }

    private mapPublicProfile(profile: { id: string; sessionKey: string; name: string; email: string | null; location: string | null; birthDate: Date | null; targetedRole: string | null; organization: string | null; skills: string[]; education: string[]; experiences: string[]; achievements: string[]; githubUrl: string | null; linkedinUrl: string | null; twitterUrl: string | null; avatarUrl: string | null; profileCompleted: boolean; isDeactivated: boolean; deactivatedAt: Date | null; subscription: string; subscriptionEndDate: Date | null; createdAt: Date; updatedAt: Date }) {
        return {
            id: profile.sessionKey, session_key: profile.sessionKey, name: profile.name || null,
            email: profile.email, location: profile.location, birthday: this.toDateOnlyString(profile.birthDate),
            targeted_role: profile.targetedRole, organization: profile.organization, skills: profile.skills,
            education: profile.education, experiences: profile.experiences, achievements: profile.achievements,
            github_url: profile.githubUrl, linkedin_url: profile.linkedinUrl, twitter_url: profile.twitterUrl,
            avatar_url: profile.avatarUrl, profile_completed: profile.profileCompleted,
            profile_completion: this.calculatePublicProfileCompletion(profile),
            subscription: (profile.subscription || 'Starter') as 'Starter' | 'Achiever' | 'Expert',
            subscription_end_date: profile.subscriptionEndDate?.toISOString() ?? null,
            is_deactivated: profile.isDeactivated, deactivated_at: profile.deactivatedAt?.toISOString() ?? null,
            is_verified: true, last_login: null, created_at: profile.createdAt.toISOString(), updated_at: profile.updatedAt.toISOString(),
        }
    }

    private calculatePublicProfileCompletion(profile: { name: string; location: string | null; birthDate: Date | null; githubUrl: string | null; linkedinUrl: string | null; twitterUrl: string | null; targetedRole: string | null; organization: string | null; skills: string[]; experiences: string[]; education: string[]; achievements: string[] }) {
        const fields = [profile.name, profile.location, profile.birthDate, profile.linkedinUrl, profile.githubUrl, profile.twitterUrl, profile.targetedRole, profile.organization, profile.skills, profile.experiences, profile.education, profile.achievements]
        const completed = fields.filter((value) => {
            if (Array.isArray(value)) return value.length > 0
            if (value instanceof Date) return true
            return typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
        }).length
        return Math.round((completed / fields.length) * 100)
    }

    private normalizeProfileName(value: string | null | undefined) { return this.toNullableString(value) ?? '' }

    private toNullableString(value: string | null | undefined) {
        if (typeof value !== 'string') return null
        const trimmed = value.trim()
        return trimmed ? trimmed : null
    }

    private toStringList(value: string[] | null | undefined) {
        if (!Array.isArray(value)) return []
        return this.uniqueStrings(value.map((item) => String(item)))
    }

    private toNullableDate(value: string | null | undefined) {
        if (!value) return null
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date
    }

    private toDateOnlyString(value: Date | null) { return value ? value.toISOString().slice(0, 10) : null }

    private mapQuestionSession(session: { id: string; status: string; questionsJson: unknown; metadata: unknown; createdAt: Date; updatedAt: Date; expiresAt: Date | null }) {
        return { id: session.id, question_job_id: session.id, rewrite_job_id: null, status: session.status, questions_json: session.questionsJson as Record<string, string>, metadata: session.metadata as Record<string, unknown>, created_at: session.createdAt.toISOString(), updated_at: session.updatedAt.toISOString(), expires_at: session.expiresAt?.toISOString() ?? null }
    }

    private mapCv(cv: { id: string; sessionKey: string; originalScore: number; finalScore: number; jobTitle: string; jobsSummary: string; reviewImprovements: string[]; anonymizedCvText: string | null; createdAt: Date }, baseUrl: string) {
        return { id: cv.id, user_id: cv.sessionKey, pdf_url: `${baseUrl}/download_cv/${cv.id}`, original_score: cv.originalScore, final_score: cv.finalScore, job_title: cv.jobTitle, jobs_summary: cv.jobsSummary, review_improvements: cv.reviewImprovements, anonymized_cv_text: cv.anonymizedCvText, created_at: cv.createdAt.toISOString() }
    }

    private mapCareerGuide(guide: { id: string; sessionKey: string; currentStrengths: string[]; readinessScore: number; skillsToLearn: string[]; projectsToWorkOn: string[]; softSkillsToDevelop: string[]; careerRoadmap: string[]; domain: string; currentJob: string; targetJob: string | null; createdAt: Date; updatedAt: Date }) {
        return { id: guide.id, user_id: guide.sessionKey, current_strengths: guide.currentStrengths, readiness_score: guide.readinessScore, skills_to_learn: guide.skillsToLearn, projects_to_work_on: guide.projectsToWorkOn, soft_skills_to_develop: guide.softSkillsToDevelop, career_roadmap: guide.careerRoadmap, domain: guide.domain, current_job: guide.currentJob, target_job: guide.targetJob, created_at: guide.createdAt.toISOString(), updated_at: guide.updatedAt.toISOString() }
    }

    private mapInterview(interview: { id: string; sessionKey: string; interviewerName: string; interviewerRole: string; interviewStyle: string; difficultyLevel: string; totalExchanges: number; overallScore: number; technicalCompetency: number; communicationSkills: number; problemSolving: number; culturalFit: number; acceptanceProbability: number; keyStrengths: string[]; areasForImprovement: string[]; recommendations: string[]; nextSteps: string[]; summary: string; createdAt: Date; updatedAt: Date }, baseUrl: string) {
        return { id: interview.id, user_id: interview.sessionKey, interviewer_name: interview.interviewerName, interviewer_role: interview.interviewerRole, interview_style: interview.interviewStyle, difficulty_level: interview.difficultyLevel, total_exchanges: interview.totalExchanges, overall_score: interview.overallScore, technical_competency: interview.technicalCompetency, communication_skills: interview.communicationSkills, problem_solving: interview.problemSolving, cultural_fit: interview.culturalFit, acceptance_probability: interview.acceptanceProbability, key_strengths: interview.keyStrengths, areas_for_improvement: interview.areasForImprovement, recommendations: interview.recommendations, next_steps: interview.nextSteps, summary: interview.summary, pdf_url: `${baseUrl}/onboard/interviews/${interview.id}/pdf`, created_at: interview.createdAt.toISOString(), updated_at: interview.updatedAt.toISOString() }
    }

    private buildPortfolioHtml(input: { profile: { name: string; email: string | null; location: string | null; targetedRole: string | null; skills: string[]; education: string[]; experiences: string[]; achievements: string[]; githubUrl: string | null; linkedinUrl: string | null; twitterUrl: string | null; avatarUrl: string | null }; cvText: string; wireframe: string; theme: string; personalInfo: Record<string, unknown>; photoUrl?: string }) {
        const profile = input.profile
        const mergedSkills = this.uniqueStrings([...profile.skills, ...(Array.isArray(input.personalInfo.skills) ? input.personalInfo.skills.map((v) => String(v)) : [])]).slice(0, 8)
        const experiences = this.collectListField(input.personalInfo.experiences, profile.experiences)
        const education = this.collectListField(input.personalInfo.education, profile.education)
        const achievements = this.collectListField(input.personalInfo.achievements, profile.achievements)
        const summary = this.createProfessionalSummary(input.cvText || JSON.stringify(input.personalInfo), profile.targetedRole || 'Software Engineer')
        const accent = this.resolvePortfolioAccent(input.theme)
        const photoUrl = input.photoUrl || profile.avatarUrl
        const renderList = (items: string[]) => items.length ? items.map((item) => `<li>${this.escapeHtml(item)}</li>`).join('') : '<li>Content coming soon.</li>'
        const socials = [profile.githubUrl ? `<a href="${this.escapeHtml(profile.githubUrl)}" target="_blank" rel="noreferrer">GitHub</a>` : '', profile.linkedinUrl ? `<a href="${this.escapeHtml(profile.linkedinUrl)}" target="_blank" rel="noreferrer">LinkedIn</a>` : '', profile.twitterUrl ? `<a href="${this.escapeHtml(profile.twitterUrl)}" target="_blank" rel="noreferrer">X</a>` : ''].filter(Boolean).join(' · ')

        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${this.escapeHtml(profile.name)} Portfolio</title><style>:root{--accent:${accent};--bg:#f7f7fb;--card:#ffffff;--text:#121826;--muted:#5b6475;--border:#d8dce6}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:radial-gradient(circle at top left,rgba(255,255,255,0.9),transparent 35%),linear-gradient(135deg,#eef2ff,var(--bg));color:var(--text)}.page{max-width:1080px;margin:0 auto;padding:48px 24px 64px}.hero{display:grid;grid-template-columns:140px 1fr;gap:24px;align-items:center;background:var(--card);border:1px solid var(--border);border-radius:28px;padding:32px;box-shadow:0 24px 60px rgba(15,23,42,0.08)}.avatar{width:140px;height:140px;border-radius:24px;overflow:hidden;background:linear-gradient(135deg,var(--accent),#ffffff);display:flex;align-items:center;justify-content:center;color:#fff;font-size:42px;font-weight:700}.avatar img{width:100%;height:100%;object-fit:cover}h1,h2,h3,p{margin:0}h1{font-size:40px;line-height:1.05}h2{font-size:14px;text-transform:uppercase;letter-spacing:0.12em;color:var(--accent)}h3{font-size:20px;margin-bottom:14px}.lede{margin-top:14px;color:var(--muted);font-size:17px;line-height:1.7}.meta{margin-top:18px;display:flex;flex-wrap:wrap;gap:10px;color:var(--muted);font-size:14px}.chip{padding:8px 12px;border-radius:999px;border:1px solid rgba(0,0,0,0.08);background:rgba(255,255,255,0.7)}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:24px}.card{background:var(--card);border:1px solid var(--border);border-radius:22px;padding:24px;box-shadow:0 12px 30px rgba(15,23,42,0.05)}ul{margin:0;padding-left:18px;color:var(--muted);line-height:1.7}.skills{display:flex;flex-wrap:wrap;gap:10px}.skill{padding:10px 14px;border-radius:14px;background:rgba(79,70,229,0.08);color:var(--text);font-size:14px;font-weight:600}.footer{margin-top:24px;text-align:center;color:var(--muted);font-size:14px}a{color:inherit;text-decoration:none;border-bottom:1px solid rgba(0,0,0,0.15)}@media(max-width:760px){.hero{grid-template-columns:1fr;text-align:center}.avatar{margin:0 auto}.meta,.skills{justify-content:center}}</style></head><body><main class="page" data-wireframe="${this.escapeHtml(input.wireframe)}" data-theme="${this.escapeHtml(input.theme)}"><section class="hero"><div class="avatar">${photoUrl ? `<img src="${this.escapeHtml(photoUrl)}" alt="${this.escapeHtml(profile.name)}"/>` : this.escapeHtml(profile.name.split(' ').map((p) => p.charAt(0)).join('').slice(0, 2).toUpperCase())}</div><div><h2>${this.escapeHtml(profile.targetedRole || 'Professional Portfolio')}</h2><h1>${this.escapeHtml(profile.name)}</h1><p class="lede">${this.escapeHtml(summary)}</p><div class="meta">${profile.location ? `<span class="chip">${this.escapeHtml(profile.location)}</span>` : ''}${profile.email ? `<span class="chip">${this.escapeHtml(profile.email)}</span>` : ''}${socials ? `<span class="chip">${socials}</span>` : ''}</div></div></section><section class="grid"><article class="card"><h3>Core Skills</h3><div class="skills">${mergedSkills.length ? mergedSkills.map((s) => `<span class="skill">${this.escapeHtml(s)}</span>`).join('') : '<span class="skill">Professional communication</span>'}</div></article><article class="card"><h3>Key Achievements</h3><ul>${renderList(achievements)}</ul></article><article class="card"><h3>Experience Highlights</h3><ul>${renderList(experiences)}</ul></article><article class="card"><h3>Education</h3><ul>${renderList(education)}</ul></article></section><p class="footer">Generated from the ${this.escapeHtml(input.wireframe)} wireframe with a ${this.escapeHtml(input.theme)} theme.</p></main></body></html>`
    }

    private async loadLiveJobs(filters: JobSearchFilters, resumeContent?: string, limit = 200) {
        const searchTerms = this.buildJobSearchQueries(filters, resumeContent)
        const remotiveLimit = Math.min(Math.max(limit, 24), 60)
        const providerRequests = [...searchTerms.map((term) => this.fetchRemotiveJobs(term, remotiveLimit)), this.fetchArbeitnowJobs()]
        const settled = await Promise.allSettled(providerRequests)
        const liveJobs = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
        return this.dedupeJobs(liveJobs).filter((job) => this.isTechRelevantJob(job) && !this.isExcludedJobListing(job))
    }

    private buildJobSearchQueries(filters: JobSearchFilters, resumeContent?: string) {
        const roleQueries = this.uniqueStrings([...(filters.job_functions ?? []), ...(resumeContent ? this.extractRoleKeywords(resumeContent) : []), ...(resumeContent?.trim() ? [this.detectRole(resumeContent)] : [])])
        const skillQueries = this.uniqueStrings([...(filters.required_skills ?? []), ...(resumeContent ? this.extractSkillKeywords(resumeContent) : [])])
        const combined = [...roleQueries.slice(0, 2), ...(skillQueries.length > 0 ? [skillQueries.slice(0, 3).join(' ')] : [])]
        return this.uniqueStrings(combined.length > 0 ? combined : DEFAULT_JOB_SEARCH_TERMS).slice(0, 3)
    }

    private async fetchRemotiveJobs(searchTerm: string, limit: number) {
        const cacheKey = `remotive:${searchTerm.trim().toLowerCase()}:${limit}`
        return this.fetchJobFeedWithCache(cacheKey, async () => {
            const url = new URL('https://remotive.com/api/remote-jobs')
            url.searchParams.set('limit', String(limit))
            url.searchParams.set('search', searchTerm)
            const payload = await this.fetchJson<{ jobs?: RemotiveJobRecord[] }>(url.toString())
            return (payload.jobs ?? []).map((job) => this.mapRemotiveJob(job)).filter((job): job is JobDocument => Boolean(job))
        })
    }

    private async fetchArbeitnowJobs() {
        return this.fetchJobFeedWithCache('arbeitnow:page:1', async () => {
            const url = new URL('https://www.arbeitnow.com/api/job-board-api')
            url.searchParams.set('page', '1')
            url.searchParams.set('limit', '100')
            const payload = await this.fetchJson<{ data?: ArbeitnowJobRecord[] }>(url.toString())
            return (payload.data ?? []).map((job) => this.mapArbeitnowJob(job)).filter((job): job is JobDocument => Boolean(job))
        })
    }

    private async fetchJobFeedWithCache(cacheKey: string, loader: () => Promise<JobDocument[]>) {
        const cached = this.liveJobsCache.get(cacheKey)
        if (cached && cached.expiresAt > Date.now()) return cached.jobs
        const jobs = await loader()
        this.liveJobsCache.set(cacheKey, { expiresAt: Date.now() + LIVE_JOB_CACHE_TTL_MS, jobs })
        return jobs
    }

    private async fetchJson<T>(url: string): Promise<T> {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), LIVE_JOB_FETCH_TIMEOUT_MS)
        try {
            const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal })
            if (!response.ok) throw new Error(`Failed to fetch ${url}`)
            return (await response.json()) as T
        } finally {
            clearTimeout(timeoutId)
        }
    }

    private mapRemotiveJob(job: RemotiveJobRecord): JobDocument | null {
        if (!job.id || !job.url || !job.title || !job.company_name) return null
        const description = this.stripHtml(job.description || '')
        const location = job.candidate_required_location?.trim() ? `Remote - ${job.candidate_required_location.trim()}` : 'Remote'
        return { job_id: `remotive-${job.id}`, title: job.title, company: job.company_name, location, work_model: 'remote', description, employment_type: this.normalizeEmploymentType(job.job_type), seniority_level: this.detectSeniorityLevel(`${job.title} ${description}`), job_function: this.inferJobFunction(`${job.title} ${description}`) || 'Technology', industries: job.category || 'Remote', salary: job.salary?.trim() || undefined, company_logo_url: job.company_logo_url?.trim() || job.company_logo?.trim() || undefined, source: 'Remotive', source_url: job.url, posted_date: job.publication_date ? new Date(job.publication_date).toISOString() : new Date().toISOString() }
    }

    private mapArbeitnowJob(job: ArbeitnowJobRecord): JobDocument | null {
        if (!job.slug || !job.url || !job.title || !job.company_name) return null
        const description = this.stripHtml(job.description || '')
        const rawTypes = job.job_types ?? []
        const workModel = this.detectWorkModel(job.remote === true, `${job.title} ${description} ${rawTypes.join(' ')}`)
        const location = workModel === 'remote' ? (job.location?.trim() ? `${job.location.trim()} / Remote` : 'Remote') : job.location?.trim() || 'On-site'
        return { job_id: `arbeitnow-${job.slug}`, title: job.title, company: job.company_name, location, work_model: workModel, description, employment_type: this.normalizeEmploymentType(rawTypes), seniority_level: this.detectSeniorityLevel(`${job.title} ${description} ${rawTypes.join(' ')}`), job_function: this.inferJobFunction(`${job.title} ${description}`) || 'Technology', industries: (job.tags ?? []).find((tag) => tag.toLowerCase() !== 'remote') || 'Technology', source: 'Arbeitnow', source_url: job.url, posted_date: job.created_at ? new Date(job.created_at * 1000).toISOString() : new Date().toISOString() }
    }

    private normalizeEmploymentType(value: string | string[] | undefined) {
        const text = (Array.isArray(value) ? value.join(' ') : value || '').toLowerCase()
        if (text.includes('intern') || text.includes('graduate') || text.includes('working student')) return 'internship'
        if (text.includes('part') || text.includes('teilzeit')) return 'part_time'
        if (text.includes('contract') || text.includes('freelance') || text.includes('consult')) return text.includes('freelance') ? 'freelance' : 'contract'
        return 'full_time'
    }

    private detectWorkModel(isRemote: boolean, text: string) {
        if (isRemote) return 'remote'
        return text.toLowerCase().includes('hybrid') ? 'hybrid' : 'onsite'
    }

    private detectSeniorityLevel(text: string) {
        const n = text.toLowerCase()
        if (n.includes('senior') || n.includes('lead') || n.includes('principal') || n.includes('staff') || n.includes('manager') || n.includes('director') || n.includes('head of')) return 'senior'
        if (n.includes('intern') || n.includes('junior') || n.includes('entry') || n.includes('graduate') || n.includes('working student')) return 'entry'
        return 'mid'
    }

    private inferJobFunction(text: string) {
        const n = text.toLowerCase()
        const exactRole = this.extractRoleKeywords(n)[0]
        if (exactRole) return this.toTitle(exactRole)
        if (n.includes('qa engineer') || n.includes('quality assurance')) return 'QA Engineer'
        if (n.includes('devops') || n.includes('site reliability') || n.includes('sre')) return 'Devops Engineer'
        if (n.includes('frontend') || n.includes('front end')) return 'Frontend Engineer'
        if (n.includes('backend') || n.includes('back end')) return 'Backend Engineer'
        if (n.includes('fullstack') || n.includes('full stack')) return 'Full Stack Engineer'
        if (n.includes('designer') && (n.includes('ux') || n.includes('ui') || n.includes('product'))) return 'UI UX Designer'
        if (n.includes('product manager')) return 'Product Manager'
        if (n.includes('data engineer') || n.includes('analytics engineer')) return 'Data Engineer'
        if (n.includes('data scientist')) return 'Data Scientist'
        if (n.includes('machine learning') || n.includes('ml engineer')) return 'Ml Engineer'
        if (n.includes('software engineer') || n.includes('developer') || n.includes('programmer')) return 'Software Engineer'
        return ''
    }

    private dedupeJobs(jobs: JobDocument[]) {
        const seen = new Set<string>()
        return jobs.filter((job) => {
            const key = `${job.source_url}|${job.title.toLowerCase()}|${job.company.toLowerCase()}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
    }

    private isTechRelevantJob(job: JobDocument) {
        const haystack = `${job.title} ${job.description} ${job.industries ?? ''}`.toLowerCase()
        return TECH_JOB_KEYWORDS.some((keyword) => haystack.includes(keyword))
    }

    private isExcludedJobListing(job: JobDocument) {
        const haystack = `${job.title} ${job.description} ${job.industries ?? ''}`.toLowerCase()
        return EXCLUDED_JOB_KEYWORDS.some((keyword) => haystack.includes(keyword))
    }

    private stripHtml(value: string) {
        return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&#x26;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, ' ').trim()
    }

    private buildNoJobsMessage(hasResumeContext: boolean) {
        return hasResumeContext
            ? 'No jobs available right now for your current CV and filters. Try broadening the role or removing a filter.'
            : 'No jobs available right now. Select a CV or adjust your filters to fetch live matches.'
    }

    private matchesFilters(job: JobDocument, filters: JobSearchFilters) {
        const now = Date.now()
        const postedWithinMs = (filters.posted_within_days ?? 365) * 86400000
        const postedRecentlyEnough = now - new Date(job.posted_date).getTime() <= postedWithinMs
        const includesValue = (values: string[] | undefined, target: string) => !values || values.length === 0 || values.some((v) => target.toLowerCase().includes(v.toLowerCase()))
        return postedRecentlyEnough && includesValue(filters.job_functions, job.job_function) && includesValue(filters.job_types, job.employment_type) && includesValue(filters.work_models, job.work_model || job.location) && includesValue(filters.experience_levels, job.seniority_level) && includesValue(filters.locations, job.location) && (!filters.required_skills || filters.required_skills.length === 0 || filters.required_skills.some((skill) => `${job.title} ${job.description} ${job.industries || ''}`.toLowerCase().includes(skill.toLowerCase())))
    }

    private scoreJob(job: JobDocument, resumeContent: string) {
        if (!resumeContent.trim()) {
            const daysOld = Math.max(0, Math.floor((Date.now() - new Date(job.posted_date).getTime()) / 86400000))
            return Math.max(55, 92 - daysOld * 4)
        }
        const haystack = `${job.title} ${job.description} ${job.job_function} ${job.industries}`.toLowerCase()
        const tokens = this.tokenize(resumeContent).slice(0, 18)
        const matches = tokens.filter((token) => haystack.includes(token)).length
        const preferredRole = this.extractRoleKeywords(resumeContent)[0]
        const roleHits = this.extractRoleKeywords(resumeContent).filter((role) => haystack.includes(role.toLowerCase())).length
        const roleAlignmentBoost = preferredRole ? (haystack.includes(preferredRole.toLowerCase()) ? 12 : -8) : 0
        return Math.max(52, Math.min(99, 54 + matches * 5 + roleHits * 7 + roleAlignmentBoost))
    }

    private extractRoleKeywords(text: string) {
        const roles = ['frontend engineer', 'backend engineer', 'full stack engineer', 'software engineer', 'data engineer', 'data scientist', 'ml engineer', 'product manager', 'ui ux designer']
        const normalized = text.toLowerCase()
        return roles.filter((role) => normalized.includes(role))
    }

    private parseCareerGuideInsights(content: string): { current_strengths?: string[]; readiness_score?: number; skills_to_learn?: string[]; projects_to_work_on?: string[]; soft_skills_to_develop?: string[]; career_roadmap?: string[] } {
        const cleaned = content.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        return {
            current_strengths: this.ensureStringArray(parsed.current_strengths),
            readiness_score: this.ensureReadinessScore(parsed.readiness_score),
            skills_to_learn: this.ensureStringArray(parsed.skills_to_learn),
            projects_to_work_on: this.ensureStringArray(parsed.projects_to_work_on),
            soft_skills_to_develop: this.ensureStringArray(parsed.soft_skills_to_develop),
            career_roadmap: this.ensureStringArray(parsed.career_roadmap),
        }
    }

    private buildCareerGuidePrompt(input: { currentJob: string; domain: string; targetRole: string; roleBlueprint: CareerBlueprint; extractedCv: string; profileData: string[]; cvSkills: string[] }) {
        const cvBlock = input.extractedCv ? input.extractedCv.slice(0, 4000) : 'No CV text available'

        // Separate profile signals into named groups for clarity
        const skillsSignal   = input.profileData.find((s) => s.startsWith('skills:'))      ?? ''
        const eduSignal      = input.profileData.find((s) => s.startsWith('education:'))   ?? ''
        const expSignal      = input.profileData.find((s) => s.startsWith('experiences:')) ?? ''
        const achieveSignal  = input.profileData.find((s) => s.startsWith('achievements:')) ?? ''
        const orgSignal      = input.profileData.find((s) => s.startsWith('organization:')) ?? ''
        const otherSignals   = input.profileData.filter((s) =>
            !s.startsWith('skills:') && !s.startsWith('education:') &&
            !s.startsWith('experiences:') && !s.startsWith('achievements:') &&
            !s.startsWith('organization:'),
        )

        return [
            '=== CANDIDATE PROFILE ===',
            `Current role: ${input.currentJob}`,
            `Target role: ${input.targetRole}`,
            `Domain: ${input.domain}`,
            orgSignal      ? `Organization: ${orgSignal.replace('organization:', '').trim()}` : '',
            skillsSignal   ? `Declared skills: ${skillsSignal.replace('skills:', '').trim()}` : '',
            `CV-detected skills: ${input.cvSkills.length ? input.cvSkills.join(', ') : 'none found'}`,
            eduSignal      ? `Education: ${eduSignal.replace('education:', '').trim()}` : '',
            expSignal      ? `Experience entries: ${expSignal.replace('experiences:', '').trim()}` : '',
            achieveSignal  ? `Achievements / certifications: ${achieveSignal.replace('achievements:', '').trim()}` : '',
            otherSignals.length ? `Other profile data:\n${otherSignals.map((l) => `  - ${l}`).join('\n')}` : '',
            '',
            '=== TARGET ROLE BLUEPRINT ===',
            `Must-have skills: ${input.roleBlueprint.mustHaveSkills.join(', ')}`,
            `Strengths focus: ${input.roleBlueprint.strengthsFocus.join(', ')}`,
            `Roadmap focus: ${input.roleBlueprint.roadmapFocus.join(', ')}`,
            '',
            '=== FULL CV TEXT ===',
            cvBlock,
            '',
            '=== INSTRUCTIONS ===',
            '1. current_strengths: 3-4 bullets that name SPECIFIC skills or achievements from the declared skills, CV-detected skills, and achievements above — not generic.',
            '2. readiness_score: compare the candidate\'s declared+detected skills against the must-have skills. Be strict and realistic.',
            '3. skills_to_learn: list only skills from the must-have blueprint that are ABSENT from declared and CV-detected skills.',
            '4. projects_to_work_on: suggest 3-4 projects that directly address the gaps identified in skills_to_learn, relevant to the domain.',
            '5. soft_skills_to_develop: 3-4 behavioral skills specific to the target role.',
            '6. career_roadmap: 5 concrete steps with timeline labels (Week 1-2, Month 1, Month 2, Month 3, Month 4+) that account for the candidate\'s CURRENT education and experience level.',
            'Return JSON only.',
        ].filter((line) => line !== '').join('\n')
    }

    private collectCareerGuideSignals(profileData?: Record<string, unknown>) {
        if (!profileData) return [] as string[]
        const signals: string[] = []
        for (const [key, value] of Object.entries(profileData)) {
            if (value == null) continue
            if (Array.isArray(value)) {
                const joined = value.map((item) => String(item).trim()).filter(Boolean)
                if (joined.length) signals.push(`${key}: ${joined.join(', ')}`)
                continue
            }
            const text = String(value).trim()
            if (text) signals.push(`${key}: ${text}`)
        }
        return signals
    }

    private buildCareerStrengths(cvText: string, profileSignals: string[], targetRole: string, roleBlueprint: CareerBlueprint, cvSkills: string[]) {
        const normalizedCvSkills = new Set(cvSkills.map((s) => s.toLowerCase()))
        const matchedRoleSkills = roleBlueprint.mustHaveSkills.filter((s) => normalizedCvSkills.has(s.toLowerCase()) || cvText.toLowerCase().includes(s.toLowerCase()))
        const transferableSkills = cvSkills.filter((s) => !roleBlueprint.mustHaveSkills.some((t) => t.toLowerCase() === s.toLowerCase()))
        const rolePhrase = roleBlueprint.family === 'ai-data' ? 'AI/data work' : roleBlueprint.family === 'frontend' ? 'frontend delivery' : roleBlueprint.family === 'backend' ? 'backend delivery' : roleBlueprint.family === 'product' ? 'product execution' : roleBlueprint.family === 'design' ? 'design craft' : roleBlueprint.family === 'devops' ? 'reliability and automation' : 'engineering delivery'
        return this.uniqueStrings([
            matchedRoleSkills.length ? `Direct overlap with ${rolePhrase}: ${matchedRoleSkills.join(', ')}` : `Transferable foundation for ${targetRole} from ${transferableSkills.slice(0, 3).join(', ') || 'core engineering work'}`,
            transferableSkills.length ? `Transferable strengths: ${transferableSkills.slice(0, 3).join(', ')}` : `Evidence of ${roleBlueprint.strengthsFocus[0] || 'solid engineering habits'}`,
            profileSignals.length ? `Profile context supports ${targetRole}: ${profileSignals.slice(0, 2).join(' | ')}` : `Profile can be shaped toward ${targetRole}`,
            `Roadmap should focus on ${roleBlueprint.roadmapFocus.slice(0, 2).join(' and ')}`,
        ])
    }

    private buildCareerBlueprint(targetRole: string, domain: string, cvSkills: string[] = [], cvText = ''): CareerBlueprint {
        const text = `${targetRole} ${domain}`.toLowerCase()
        if (text.includes('ai engineer') || text.includes('ml engineer') || text.includes('machine learning') || text.includes('data scientist') || text.includes('llm') || text.includes('nlp') || (text.includes('ai') && !text.includes('trail') && !text.includes('detail'))) {
            return { family: 'ai-data', mustHaveSkills: ['Python', 'LLMs', 'RAG', 'model evaluation', 'data pipelines', 'SQL'], strengthsFocus: ['AI system building', 'LLM integration', 'experimentation'], roadmapFocus: ['AI project showcase', 'model evaluation case study', 'portfolio write-up'], transferables: ['curiosity', 'problem framing', 'documentation'] }
        }
        if (text.includes('product manager') || text.includes('product owner')) {
            return { family: 'product', mustHaveSkills: ['roadmapping', 'metrics', 'stakeholder management', 'discovery', 'prioritization'], strengthsFocus: ['product thinking', 'communication', 'priority setting'], roadmapFocus: ['product brief', 'experiment design', 'metrics case study'], transferables: ['structured thinking', 'user empathy', 'cross-functional work'] }
        }
        if (text.includes('devops') || text.includes('cloud engineer') || text.includes('sre') || text.includes('site reliability')) {
            return { family: 'devops', mustHaveSkills: ['CI/CD', 'Docker', 'Kubernetes', 'cloud', 'observability', 'automation'], strengthsFocus: ['reliability', 'automation', 'systems thinking'], roadmapFocus: ['deployment pipeline', 'infra project', 'incident playbook'], transferables: ['discipline', 'troubleshooting', 'documentation'] }
        }
        if (text.includes('data engineer') || text.includes('data scientist') || text.includes('data analyst')) {
            return { family: 'ai-data', mustHaveSkills: ['Python', 'SQL', 'data pipelines', 'statistics', 'model evaluation'], strengthsFocus: ['analytical thinking', 'experimentation', 'workflow rigor'], roadmapFocus: ['data project', 'modeling case study', 'portfolio write-up'], transferables: ['curiosity', 'problem framing', 'documentation'] }
        }
        if (text.includes('frontend') || text.includes('front end')) {
            return { family: 'frontend', mustHaveSkills: ['React', 'TypeScript', 'component design', 'accessibility', 'state management'], strengthsFocus: ['UI building', 'component reuse', 'frontend delivery'], roadmapFocus: ['frontend case study', 'design system work', 'performance and accessibility'], transferables: ['visual thinking', 'collaboration', 'iteration speed'] }
        }
        if (text.includes('backend') || text.includes('back end') || text.includes('api engineer') || text.includes('server')) {
            return { family: 'backend', mustHaveSkills: ['Node.js', 'APIs', 'database design', 'testing', 'system design'], strengthsFocus: ['service design', 'reliability', 'data modeling'], roadmapFocus: ['API project', 'database work', 'deployment and testing'], transferables: ['ownership', 'debugging', 'communication'] }
        }
        if (text.includes('designer') || text.includes('ux') || text.includes('ui designer')) {
            return { family: 'design', mustHaveSkills: ['research', 'prototyping', 'design systems', 'Figma', 'interaction design'], strengthsFocus: ['visual judgment', 'user empathy', 'iteration'], roadmapFocus: ['case study', 'design system', 'research-backed redesign'], transferables: ['communication', 'storytelling', 'attention to detail'] }
        }
        const stackText = `${cvSkills.join(' ')} ${cvText}`.toLowerCase()
        const webSignals = ['react', 'next.js', 'typescript', 'javascript', 'node.js', 'nestjs', 'postgresql', 'supabase', 'docker', 'tailwind']
        const looksLikeWebStack = webSignals.filter((s) => stackText.includes(s)).length >= 4
        if (looksLikeWebStack || text.includes('full stack') || text.includes('software engineer') || text.includes('web')) {
            return { family: 'web-software', mustHaveSkills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Docker'], strengthsFocus: ['frontend delivery', 'full-stack integration', 'shipping features'], roadmapFocus: ['full-stack portfolio app', 'system design stories', 'deployment and testing'], transferables: ['problem solving', 'debugging', 'collaboration'] }
        }
        return { family: 'software', mustHaveSkills: ['JavaScript', 'TypeScript', 'Git', 'testing', 'system design'], strengthsFocus: ['engineering fundamentals', 'delivery habits', 'communication'], roadmapFocus: ['portfolio project', 'interview stories', 'job applications'], transferables: ['adaptability', 'learning speed', 'collaboration'] }
    }

    private buildSkillGaps(domain: string, targetRole: string, cvSkills: string[], roleBlueprint?: CareerBlueprint) {
        const rb = roleBlueprint ?? this.buildCareerBlueprint(targetRole, domain, cvSkills)
        const cvSkillSet = new Set(cvSkills.map((s) => s.toLowerCase()))
        const pickMissing = (candidates: string[]) => candidates.filter((item) => !cvSkillSet.has(item.toLowerCase()))
        const seed = `${domain} ${targetRole}`.toLowerCase()
        const extras = seed.includes('data') || seed.includes('ai') || seed.includes('ml') ? ['SQL modeling', 'data quality monitoring'] : seed.includes('design') ? ['interaction prototyping', 'research synthesis'] : seed.includes('product') ? ['metrics analysis', 'experiment design', 'roadmapping tools'] : seed.includes('devops') || seed.includes('cloud') ? ['observability', 'cloud security', 'Kubernetes'] : ['performance optimization', 'system design', 'testing strategies']
        return pickMissing([...rb.mustHaveSkills, ...extras])
    }

    private buildProjects(domain: string, targetRole: string, cvSkills: string[], roleBlueprint?: CareerBlueprint) {
        const rb = roleBlueprint ?? this.buildCareerBlueprint(targetRole, domain, cvSkills)
        const base = `${domain} ${targetRole}`.toLowerCase()
        const skillHint = cvSkills.length ? `using ${cvSkills.slice(0, 2).join(' and ')}` : 'using your strongest tools'
        const roadmapFocus = rb.roadmapFocus.length ? rb.roadmapFocus[0] : 'portfolio project'
        if (base.includes('data') || base.includes('ai') || base.includes('ml')) return [`Build an end-to-end ML pipeline ${skillHint}`, 'Create a RAG-powered chatbot with evaluation metrics', 'Publish a data science project with measurable business impact', 'Build a model monitoring dashboard with drift detection']
        if (base.includes('product')) return ['Write a full product spec for a feature with success metrics', 'Create a prioritization framework and apply it to a real product', 'Document a user research study and translate findings into requirements', 'Build a product analytics dashboard to track key KPIs']
        if (base.includes('devops') || base.includes('cloud')) return ['Automate deployment for a service with observability and rollback', 'Build infrastructure as code for a production-like environment', 'Document an incident-response playbook for a sample system', 'Set up a full CI/CD pipeline with automated testing and monitoring']
        if (base.includes('design')) return ['Redesign a complex workflow and document the case study', 'Create a small design system with tokens and reusable components', 'Prototype a mobile-first onboarding flow and test it with users', 'Document a full UX research study with actionable findings']
        return [`Ship a ${roadmapFocus} ${skillHint}`, 'Build a feature-rich dashboard with measurable outcomes', 'Create a polished side project tailored to the role you want next', 'Contribute to an open-source project relevant to your target role']
    }

    private buildSoftSkillRecommendations(targetRole: string, domain: string) {
        const seed = `${targetRole} ${domain}`.toLowerCase()
        if (seed.includes('product')) return ['Stakeholder alignment', 'Priority negotiation', 'Outcome storytelling', 'Cross-functional leadership']
        if (seed.includes('design')) return ['Design critique', 'Research synthesis', 'Explaining tradeoffs', 'User empathy']
        if (seed.includes('data') || seed.includes('ai') || seed.includes('ml')) return ['Cross-functional communication', 'Explaining insights clearly', 'Problem framing', 'Research presentation']
        if (seed.includes('devops')) return ['Incident communication', 'Documentation discipline', 'Systems thinking', 'Proactive monitoring mindset']
        return ['Stakeholder communication', 'Prioritization', 'Clear technical storytelling', 'Collaboration under pressure']
    }

    private buildCareerRoadmap(targetRole: string, domain: string, cvSkills: string[], roleBlueprint?: CareerBlueprint) {
        const rb = roleBlueprint ?? this.buildCareerBlueprint(targetRole, domain, cvSkills)
        const role = targetRole.toLowerCase()
        const isAiRole = ['ai engineer', 'ml engineer', 'machine learning', 'data scientist', 'llm', 'nlp'].some((k) => role.includes(k))
        const isBackendRole = ['backend', 'back end', 'api engineer', 'server'].some((k) => role.includes(k))
        const isPmRole = ['product manager', 'product owner'].some((k) => role.includes(k))
        const isDevOpsRole = ['devops', 'cloud engineer', 'sre', 'site reliability'].some((k) => role.includes(k))
        const aiSkills = cvSkills.filter((s) => ['Python', 'LlamaIndex', 'LangChain', 'RAG', 'PyTorch', 'TensorFlow', 'Hugging Face', 'scikit-learn'].includes(s))
        const backendSkills = cvSkills.filter((s) => ['Node.js', 'NestJS', 'PostgreSQL', 'MongoDB', 'Express', 'Docker', 'FastAPI'].includes(s))
        const devopsSkills = cvSkills.filter((s) => ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'].includes(s))
        const frontendSkills = cvSkills.filter((s) => ['React', 'TypeScript', 'Next.js', 'JavaScript', 'Tailwind'].includes(s))
        const skillsHint = isAiRole && aiSkills.length ? aiSkills.slice(0, 2).join(', ') : isBackendRole && backendSkills.length ? backendSkills.slice(0, 2).join(', ') : isDevOpsRole && devopsSkills.length ? devopsSkills.slice(0, 2).join(', ') : isPmRole ? 'analytical and product thinking skills' : frontendSkills.length ? frontendSkills.slice(0, 2).join(', ') : cvSkills.slice(0, 2).join(', ') || 'your current strengths'
        const [firstFocus, secondFocus, thirdFocus] = rb.roadmapFocus
        return [
            `Week 1-2: Reframe your CV around ${targetRole} highlighting ${skillsHint}.`,
            `Month 1: Close the top gap in ${targetRole} skills with one focused mini-project.`,
            `Month 2: Turn that project into a case study around ${firstFocus || 'portfolio value'}.`,
            `Month 3: Practice interview stories and refine examples around ${secondFocus || 'delivery and impact'}.`,
            `Month 4+: Apply to ${targetRole} roles and tailor each CV to the job and domain (${domain}) using recruiter feedback and ${thirdFocus || 'job-specific evidence'}.`,
        ]
    }

    private resolveCareerGuideScore(input: { extractedCv: string; targetRole: string; domain: string; currentStrengths: string[]; profileSignals: string[]; cvSkills: string[]; roleBlueprint: CareerBlueprint }) {
        const targetText = `${input.targetRole} ${input.domain}`.toLowerCase()
        const targetSkills = this.uniqueStrings([...input.roleBlueprint.mustHaveSkills, ...input.roleBlueprint.strengthsFocus])
        const cvText = input.extractedCv.toLowerCase()
        const skillMatches = input.cvSkills.filter((skill) => targetSkills.some((t) => skill.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(skill.toLowerCase()))).length
        const keywordMatches = targetSkills.filter((skill) => cvText.includes(skill.toLowerCase())).length
        const roleMatches = this.extractRoleKeywords(cvText).filter((role) => targetText.includes(role.toLowerCase())).length
        const signalBonus = Math.min(10, input.profileSignals.length * 2)
        const strengthBonus = Math.min(8, input.currentStrengths.length * 2)
        const gapPenalty = Math.max(0, 8 - keywordMatches)
        const overlapScore = 34 + skillMatches * 10 + keywordMatches * 5 + roleMatches * 6 + signalBonus + strengthBonus - gapPenalty * 2
        return Math.max(20, Math.min(99, Math.round(overlapScore)))
    }

    private ensureStringArray(value: unknown) {
        if (!Array.isArray(value)) return [] as string[]
        return this.uniqueStrings(
            value.map((item) => {
                if (item === null || item === undefined) return ''
                if (typeof item === 'string') return item.trim()
                if (typeof item === 'object') {
                    // AI sometimes returns objects like {step, timeline} or {label, description}
                    const obj = item as Record<string, unknown>
                    const primary = obj.step ?? obj.description ?? obj.label ?? obj.title ?? obj.text ?? obj.action ?? obj.detail
                    if (primary) return String(primary).trim()
                    // Fallback: join all string values with a separator
                    const parts = Object.values(obj)
                        .filter((v) => typeof v === 'string' && (v as string).trim())
                        .map((v) => (v as string).trim())
                    return parts.join(' — ')
                }
                return String(item).trim()
            }).filter(Boolean),
        )
    }

    private ensureReadinessScore(value: unknown) {
        const score = Number(value)
        if (!Number.isFinite(score)) return undefined
        return Math.max(0, Math.min(100, Math.round(score)))
    }

    private extractSkillKeywords(text: string) {
        const skills = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Next.js', 'Prisma', 'NestJS', 'PostgreSQL', 'Python', 'Docker', 'AWS', 'Kubernetes', 'Figma', 'Machine Learning', 'Supabase', 'GraphQL', 'Tailwind', 'LangChain', 'LlamaIndex', 'Hugging Face', 'PyTorch', 'TensorFlow', 'scikit-learn', 'Pinecone', 'ChromaDB', 'Qdrant', 'RAG', 'OpenAI', 'Llama', 'NLP', 'Express', 'FastAPI', 'MongoDB', 'Redis', 'Git']
        const normalized = text.toLowerCase()
        return skills.filter((skill) => normalized.includes(skill.toLowerCase()))
    }

    private detectRole(text: string) {
        const roles = ['frontend engineer', 'backend engineer', 'full stack engineer', 'software engineer', 'data engineer', 'data scientist', 'devops engineer', 'product manager', 'ui ux designer', 'ml engineer']
        const normalized = text.toLowerCase()
        const found = roles.find((role) => normalized.includes(role))
        return found ? this.toTitle(found) : 'Software Engineer'
    }

    private summarizeText(text: string) {
        const cleaned = text.replace(/\s+/g, ' ').trim()
        if (!cleaned) return 'Targeted resume rewrite generated from the uploaded role context.'
        return cleaned.length > 220 ? `${cleaned.slice(0, 217)}...` : cleaned
    }

    private createProfessionalSummary(cvText: string, role: string) {
        const skills = this.extractSkillKeywords(cvText)
        const skillText = skills.length ? skills.slice(0, 4).join(', ') : 'modern product development'
        return `Results-oriented ${role} candidate with experience in ${skillText}, strong execution habits, and a clear focus on measurable user impact.`
    }

    private collectListField(value: unknown, fallback: string[]) {
        if (!value) return fallback
        if (Array.isArray(value)) return this.uniqueStrings(value.map((item) => String(item)))
        if (typeof value === 'string') return this.uniqueStrings(value.split(',').map((item) => item.trim()).filter(Boolean))
        return fallback
    }

    private uniqueStrings(values: string[]) {
        return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))
    }

    private resolvePortfolioAccent(theme: string) {
        const n = theme.toLowerCase()
        if (n.includes('minimal')) return '#0f766e'
        if (n.includes('creative')) return '#db2777'
        if (n.includes('dynamic')) return '#2563eb'
        if (n.includes('elegant')) return '#7c3aed'
        return '#4f46e5'
    }

    private escapeHtml(value: string) {
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    }

    private computeBaselineScore(text: string) {
        const lengthScore = Math.min(16, Math.floor(text.trim().split(/\s+/).length / 20))
        return Math.min(78, 58 + lengthScore)
    }

    private buildInterviewQuestion(persona: PersonaRecord, index: number, maxQuestions: number, role: string) {
        const prompts = [
            `Walk me through a project that makes you credible for a ${role} role.`,
            `What tradeoff did you make in a recent project, and why was it the right one?`,
            `Describe a difficult collaboration moment and how you kept delivery moving.`,
            `If you joined ${persona.company}, what would you want to improve in your first 90 days?`,
            `What is one gap you are actively closing to become a stronger ${role}?`,
        ]
        return prompts[Math.min(index - 1, prompts.length - 1)] ?? prompts[0]
    }

    private mapPersonaToRecruiterMode(persona: PersonaRecord): RecruiterMode {
        const tone = persona.tone.toLowerCase()
        const style = persona.style.toLowerCase()
        if (tone.includes('support') || tone.includes('warm')) return RecruiterMode.EMPATHIC
        if (tone.includes('direct') || tone.includes('sharp') || tone.includes('fast-paced')) return RecruiterMode.DIRECT
        if (style.includes('architecture') || style.includes('systems') || style.includes('technical') || style.includes('machine learning') || style.includes('data')) return RecruiterMode.TECHNICAL
        return RecruiterMode.EMPATHIC
    }

    private parseRecruiterMode(storedMode: string | null | undefined, persona: PersonaRecord): RecruiterMode {
        if (storedMode === RecruiterMode.EMPATHIC) return RecruiterMode.EMPATHIC
        if (storedMode === RecruiterMode.TECHNICAL) return RecruiterMode.TECHNICAL
        if (storedMode === RecruiterMode.DIRECT) return RecruiterMode.DIRECT
        return this.mapPersonaToRecruiterMode(persona)
    }

    private buildInterviewContext(interview: { company: string | null; jobTitle: string | null; jobDescription: string | null }, persona: PersonaRecord): InterviewContext {
        return { company: interview.company || persona.company, jobTitle: interview.jobTitle || persona.position, jobDescription: interview.jobDescription || `Interview practice for a ${interview.jobTitle || persona.position} role.` }
    }

    private async generateOpeningQuestion(context: InterviewContext, recruiterMode: RecruiterMode, persona: PersonaRecord, maxQuestions: number) {
        try {
            return await this.interviewAiService.generateQuestion(context, recruiterMode, [], 1, maxQuestions)
        } catch {
            return this.buildInterviewQuestion(persona, 1, maxQuestions, context.jobTitle || persona.position)
        }
    }

    private async maybeGenerateInterviewAudio(text: string, recruiterMode: RecruiterMode, voiceProfile?: InterviewVoiceProfile) {
        try {
            return await this.interviewAiService.textToSpeech(text, recruiterMode, voiceProfile)
        } catch {
            return null
        }
    }

    private async resolveInterviewTranscript(input: { audio?: Express.Multer.File; text?: string }) {
        const typed = input.text?.trim()
        if (typed) return typed
        if (input.audio) {
            try {
                return await this.interviewAiService.transcribeAudio(input.audio)
            } catch {
                return `Voice response received (${input.audio.originalname || 'recording'})`
            }
        }
        return 'Voice response received.'
    }

    private async evaluateInterviewAnswer(context: InterviewContext, recruiterMode: RecruiterMode, persona: PersonaRecord, currentQuestion: string, transcript: string, data: InterviewState) {
        try {
            const evaluation = await this.interviewAiService.evaluateAnswer(context, recruiterMode, currentQuestion, transcript, data.answers.length + 1, data.maxQuestions, data.turns.map((t) => ({ question: t.question, answer: t.answer })))
            return { score: Math.max(0, Math.min(100, Math.round(Number(evaluation.scores.overall) * 10))), feedback: evaluation.feedback, nextQuestion: evaluation.nextQuestion }
        } catch {
            const score = this.computeInterviewAnswerScore(transcript, persona)
            const nextQuestion = data.answers.length + 1 >= data.maxQuestions ? null : this.buildInterviewQuestion(persona, data.answers.length + 2, data.maxQuestions, context.jobTitle || persona.position)
            return { score, feedback: this.buildInterviewFeedback(score, persona), nextQuestion }
        }
    }

    private computeInterviewAnswerScore(answer: string, persona: PersonaRecord) {
        const words = answer.trim().split(/\s+/).filter(Boolean).length
        const specificityBoost = /(impact|latency|users|revenue|performance|system|delivery|design|data)/i.test(answer) ? 12 : 0
        const difficultyBoost = persona.difficulty.toLowerCase().includes('advanced') ? -4 : persona.difficulty.toLowerCase().includes('entry') ? 6 : 0
        return Math.max(48, Math.min(97, 52 + Math.min(24, words) + specificityBoost + difficultyBoost))
    }

    private buildInterviewFeedback(score: number, persona: PersonaRecord) {
        if (score >= 85) return `${persona.name} would likely see this as a confident, high-signal answer with good ownership.`
        if (score >= 70) return `Solid answer. Tighten the structure and add one sharper outcome or metric to make it stronger.`
        return `The answer needs more specifics. Add context, your actions, and the result so it feels interview-ready.`
    }

    private async finalizeInterview(id: string, data: InterviewState, persona: PersonaRecord, baseUrl: string) {
        const average = data.turns.reduce((sum, turn) => sum + turn.score, 0) / Math.max(1, data.turns.length)
        const overallScore = Math.round(average)
        const technical = Math.min(99, overallScore + 2)
        const communication = Math.min(99, overallScore + 4)
        const problemSolving = Math.max(40, overallScore - 1)
        const culturalFit = Math.max(45, overallScore - 3)
        const acceptanceProbability = Math.round((technical + communication + problemSolving + culturalFit) / 4)
        const summary = `${persona.name} saw clear potential in your responses. Your strongest moments came when you explained decisions with concrete context and outcomes.`
        const keyStrengths = ['Clear ownership of project work', 'Good alignment with the target role', 'Willingness to reflect on tradeoffs']
        const areasForImprovement = ['Use more metrics or concrete impact where possible', 'Lead with the result sooner in each answer', 'Keep answers tighter under time pressure']
        const recommendations = ['Prepare two polished project walkthroughs with measurable outcomes', 'Practice concise STAR-style answers for collaboration questions', 'Highlight technical choices and the reason behind them']
        const nextSteps = ['Rehearse your top three stories out loud', 'Refine one answer with stronger business impact', 'Run another practice round with a different persona']

        await this.createPdfDocument(`${persona.name} Interview Report`, [
            { heading: 'Summary', lines: [summary] },
            { heading: 'Key Strengths', lines: keyStrengths },
            { heading: 'Areas For Improvement', lines: areasForImprovement },
            { heading: 'Recommendations', lines: recommendations },
            { heading: 'Next Steps', lines: nextSteps },
        ])

        const updated = await this.prisma.publicInterview.update({
            where: { id },
            data: { status: 'COMPLETED', totalExchanges: data.turns.length, overallScore, technicalCompetency: technical, communicationSkills: communication, problemSolving, culturalFit, acceptanceProbability, keyStrengths, areasForImprovement, recommendations, nextSteps, summary, transcript: data.turns, data, pdfUrl: '' },
        })

        return this.mapInterview(updated, baseUrl)
    }

    private async extractTextFromFile(file: Express.Multer.File) {
        const mime = file.mimetype || ''
        if (mime.startsWith('text/')) {
            const text = file.buffer.toString('utf8').trim()
            return text || `Text extracted from ${file.originalname}`
        }
        if (mime === 'application/pdf') {
            try {
                const parsed = await pdfParse(file.buffer)
                const text = parsed.text.replace(/\s+/g, ' ').trim()
                if (text) return text
            } catch {
                return `Extracted content placeholder for ${file.originalname}. Focus on practical skills, measurable impact, and targeted role alignment.`
            }
        }
        return `Extracted content placeholder for ${file.originalname}. Focus on practical skills, measurable impact, and targeted role alignment.`
    }

    private async createPdfDocument(title: string, sections: Array<{ heading: string; lines: string[] }>) {
        const pdf = await PDFDocument.create()
        const page = pdf.addPage([595, 842])
        const font = await pdf.embedFont(StandardFonts.Helvetica)
        const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
        let y = 790
        page.drawText(title, { x: 48, y, size: 20, font: bold, color: rgb(0.09, 0.14, 0.24) })
        y -= 30
        for (const section of sections) {
            page.drawText(section.heading, { x: 48, y, size: 13, font: bold, color: rgb(0.12, 0.24, 0.52) })
            y -= 18
            for (const line of section.lines) {
                const wrapped = this.wrapText(line, 80)
                for (const item of wrapped) {
                    if (y < 60) break
                    page.drawText(item, { x: 56, y, size: 11, font, color: rgb(0.15, 0.18, 0.2) })
                    y -= 14
                }
                y -= 4
            }
            y -= 8
        }
        return Buffer.from(await pdf.save())
    }

    private async createFormattedCvPdf(cv: CvData): Promise<Buffer> {
        const doc = await PDFDocument.create()
        const fontR = await doc.embedFont(StandardFonts.Helvetica)
        const fontB = await doc.embedFont(StandardFonts.HelveticaBold)
        const fontI = await doc.embedFont(StandardFonts.HelveticaOblique)

        // ── Page geometry ──────────────────────────────────────────────────────
        const W = 595, H = 842
        const SB_W = 208, SB_PAD = 18           // sidebar width + inner padding
        const MX = SB_W + 24                    // main content left edge
        const MRX = W - 20                      // main content right edge
        const MW = MRX - MX                     // main content width (~343)
        const BOT = 32                          // bottom margin

        // ── Color palette ──────────────────────────────────────────────────────
        const C_NAVY    = rgb(0.11, 0.17, 0.29)   // sidebar background
        const C_NAVYDK  = rgb(0.07, 0.11, 0.22)   // sidebar header block (darker)
        const C_SKY     = rgb(0.32, 0.67, 0.88)   // accent / section labels
        const C_SKYDIM  = rgb(0.20, 0.44, 0.67)   // accent dimmed (dividers)
        const C_WHITE   = rgb(1, 1, 1)
        const C_SBTXT   = rgb(0.83, 0.88, 0.96)   // sidebar body text
        const C_SBMUT   = rgb(0.56, 0.63, 0.76)   // sidebar muted text
        const C_DARK    = rgb(0.09, 0.10, 0.16)   // main body text
        const C_GRAY    = rgb(0.41, 0.45, 0.52)   // main secondary text
        const C_RULE    = rgb(0.86, 0.89, 0.93)   // horizontal rules (right side)
        const C_MACC    = rgb(0.10, 0.26, 0.48)   // main section title color
        const C_TAGBG   = rgb(0.16, 0.24, 0.40)   // skill tag background

        // ── Page factory ──────────────────────────────────────────────────────
        const makePage = () => {
            const p = doc.addPage([W, H])
            p.drawRectangle({ x: 0, y: 0, width: SB_W, height: H, color: C_NAVY })
            p.drawLine({ start: { x: SB_W, y: H }, end: { x: SB_W, y: 0 }, thickness: 0.5, color: C_SKYDIM })
            return p
        }

        let page = makePage()
        let sbY = H   // sidebar y-cursor (top → bottom)
        let mY  = H   // main y-cursor  (top → bottom)

        const nextPage = () => {
            page = makePage()
            mY  = H - 28
            sbY = H - 28
        }

        // ── Sidebar utilities ──────────────────────────────────────────────────
        const sbSection = (title: string) => {
            sbY -= 9
            if (sbY < BOT) return
            page.drawText(title.toUpperCase(), { x: SB_PAD, y: sbY, size: 8, font: fontB, color: C_SKY })
            sbY -= 5
            page.drawLine({ start: { x: SB_PAD, y: sbY }, end: { x: SB_W - SB_PAD, y: sbY }, thickness: 0.4, color: C_SKYDIM })
            sbY -= 10
        }

        const sbText = (text: string, size = 9.5, color = C_SBTXT, indent = 0) => {
            const maxC = Math.floor((SB_W - SB_PAD * 2 - indent) / (size * 0.54))
            for (const line of this.wrapText(text, maxC)) {
                if (sbY < BOT) return
                page.drawText(line, { x: SB_PAD + indent, y: sbY, size, font: fontR, color })
                sbY -= size + 3.5
            }
        }

        // ── Main utilities ─────────────────────────────────────────────────────
        const mEnsure = (need: number) => {
            if (mY - need < BOT) nextPage()
        }

        const mSection = (title: string) => {
            mEnsure(28)
            page.drawText(title.toUpperCase(), { x: MX, y: mY, size: 9.5, font: fontB, color: C_MACC })
            mY -= 6
            page.drawLine({ start: { x: MX, y: mY }, end: { x: MRX, y: mY }, thickness: 0.5, color: C_RULE })
            mY -= 12
        }

        const mWrap = (text: string, size: number, font: typeof fontR, indent = 0, color = C_DARK) => {
            const maxC = Math.floor((MW - indent) / (size * 0.56))
            for (const line of this.wrapText(text, maxC)) {
                mEnsure(size + 4)
                page.drawText(line, { x: MX + indent, y: mY, size, font, color })
                mY -= size + 3
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // LEFT SIDEBAR
        // ══════════════════════════════════════════════════════════════════════

        // Header block (darker navy)
        page.drawRectangle({ x: 0, y: H - 112, width: SB_W, height: 112, color: C_NAVYDK })
        sbY = H - 18

        // Name: first part regular, last word bold
        const nameParts = (cv.name || 'Candidate').trim().split(/\s+/)
        const fName = (nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0]).slice(0, 20)
        const lName = (nameParts.length > 1 ? nameParts[nameParts.length - 1] : '').slice(0, 20)

        page.drawText(fName, { x: SB_PAD, y: sbY, size: 15, font: fontR, color: C_WHITE })
        sbY -= 19
        if (lName) {
            page.drawText(lName, { x: SB_PAD, y: sbY, size: 15, font: fontB, color: C_WHITE })
            sbY -= 19
        }

        // Job title below name
        if (cv.jobTitle) {
            const jt = cv.jobTitle.slice(0, 28)
            page.drawText(jt, { x: SB_PAD, y: sbY, size: 9, font: fontI, color: C_SKY })
            sbY -= 12
        }

        // Sky accent separator
        page.drawLine({ start: { x: SB_PAD, y: sbY }, end: { x: SB_W - SB_PAD, y: sbY }, thickness: 2.5, color: C_SKY })
        sbY -= 16

        // ── Contact ────────────────────────────────────────────────────────────
        const contactItems: Array<[string, string]> = []
        if (cv.contact.email)    contactItems.push(['Email',    cv.contact.email])
        if (cv.contact.phone)    contactItems.push(['Phone',    cv.contact.phone])
        if (cv.contact.location) contactItems.push(['Location', cv.contact.location])
        if (cv.contact.linkedin) contactItems.push(['LinkedIn', cv.contact.linkedin])

        if (contactItems.length) {
            sbSection('Contact')
            for (const [label, value] of contactItems) {
                if (sbY < BOT) break
                page.drawText(label, { x: SB_PAD, y: sbY, size: 8, font: fontB, color: C_SKY })
                sbY -= 11
                sbText(value, 9, C_SBTXT)
                sbY -= 3
            }
        }

        // ── About Me ───────────────────────────────────────────────────────────
        if (cv.summary) {
            sbSection('About Me')
            sbText(cv.summary, 9, C_SBTXT)
        }

        // ── Skills ─────────────────────────────────────────────────────────────
        if (cv.skills?.length) {
            sbSection('Skills')
            for (const skill of cv.skills) {
                if (sbY < BOT) break
                // Pill-style tag
                const tagW = Math.min(fontR.widthOfTextAtSize(skill, 9) + 14, SB_W - SB_PAD * 2)
                page.drawRectangle({ x: SB_PAD, y: sbY - 3, width: tagW, height: 15, color: C_TAGBG })
                const skillLabel = skill.length > 24 ? skill.slice(0, 23) + '…' : skill
                page.drawText(skillLabel, { x: SB_PAD + 7, y: sbY, size: 9, font: fontR, color: C_SBTXT })
                sbY -= 20
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // RIGHT MAIN CONTENT
        // ══════════════════════════════════════════════════════════════════════

        mY = H - 28

        // Top header: current/target role
        const headline = cv.jobTitle || cv.experience?.[0]?.title || 'Professional Profile'
        page.drawText(headline.slice(0, 38), { x: MX, y: mY, size: 18.5, font: fontB, color: C_DARK })
        mY -= 22
        page.drawLine({ start: { x: MX, y: mY }, end: { x: MX + 55, y: mY }, thickness: 3.5, color: C_SKY })
        mY -= 20

        // ── Professional Experience ─────────────────────────────────────────────
        if (cv.experience?.length) {
            mSection('Professional Experience')
            for (const exp of cv.experience) {
                mEnsure(32)
                // Role title + period aligned right
                page.drawText(exp.title || '', { x: MX, y: mY, size: 11.5, font: fontB, color: C_DARK })
                const pw = fontR.widthOfTextAtSize(exp.period || '', 9)
                page.drawText(exp.period || '', { x: MRX - pw, y: mY, size: 9, font: fontR, color: C_GRAY })
                mY -= 15

                // Company name (italic)
                mEnsure(14)
                page.drawText(exp.company || '', { x: MX, y: mY, size: 10, font: fontI, color: C_GRAY })
                mY -= 15

                // Bullet points
                for (const bullet of exp.bullets || []) {
                    const wrapped = this.wrapText(bullet, Math.floor((MW - 16) / (10 * 0.56)))
                    for (let i = 0; i < wrapped.length; i++) {
                        mEnsure(14)
                        page.drawText((i === 0 ? '•  ' : '    ') + wrapped[i], {
                            x: MX + 8, y: mY, size: 10, font: fontR, color: C_DARK,
                        })
                        mY -= 14
                    }
                }
                mY -= 8
            }
        }

        // ── Projects ───────────────────────────────────────────────────────────
        if (cv.projects?.length) {
            mSection('Projects')
            for (const proj of cv.projects) {
                mEnsure(30)
                page.drawText(proj.name || '', { x: MX, y: mY, size: 11.5, font: fontB, color: C_DARK })
                mY -= 15
                mWrap(proj.description || '', 10, fontR, 8)
                if (proj.tech) {
                    mEnsure(14)
                    page.drawText('Stack: ' + proj.tech, { x: MX + 8, y: mY, size: 9, font: fontI, color: C_GRAY })
                    mY -= 14
                }
                mY -= 7
            }
        }

        // ── Education ──────────────────────────────────────────────────────────
        if (cv.education?.length) {
            mSection('Education')
            for (const edu of cv.education) {
                mEnsure(28)
                page.drawText(edu.degree || '', { x: MX, y: mY, size: 11, font: fontB, color: C_DARK })
                const pw = fontR.widthOfTextAtSize(edu.period || '', 9)
                page.drawText(edu.period || '', { x: MRX - pw, y: mY, size: 9, font: fontR, color: C_GRAY })
                mY -= 14
                mEnsure(13)
                page.drawText(edu.school || '', { x: MX, y: mY, size: 10, font: fontI, color: C_GRAY })
                mY -= 16
            }
        }

        return Buffer.from(await doc.save())
    }

    private wrapText(text: string, maxChars: number) {
        const words = text.split(/\s+/)
        const lines: string[] = []
        let current = ''
        for (const word of words) {
            const next = current ? `${current} ${word}` : word
            if (next.length > maxChars) { if (current) lines.push(current); current = word } else { current = next }
        }
        if (current) lines.push(current)
        return lines
    }

    private tokenize(text: string) {
        return Array.from(new Set(text.toLowerCase().replace(/[^a-z0-9\s.+#-]/g, ' ').split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 2)))
    }

    private toTitle(value: string) {
        return value.split(' ').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    }
}