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
            settings: {
                stability: 0.47,
                similarityBoost: 0.84,
                style: 0.03,
                speed: 0.97,
                useSpeakerBoost: true,
            },
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
            settings: {
                stability: 0.5,
                similarityBoost: 0.86,
                style: 0.02,
                speed: 0.96,
                useSpeakerBoost: true,
            },
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
            settings: {
                stability: 0.52,
                similarityBoost: 0.86,
                style: 0.01,
                speed: 0.99,
                useSpeakerBoost: true,
            },
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
            settings: {
                stability: 0.43,
                similarityBoost: 0.82,
                style: 0.05,
                speed: 0.97,
                useSpeakerBoost: true,
            },
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
            settings: {
                stability: 0.5,
                similarityBoost: 0.8,
                style: 0.01,
                speed: 0.98,
                useSpeakerBoost: true,
            },
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
            settings: {
                stability: 0.56,
                similarityBoost: 0.84,
                style: 0.04,
                speed: 1.01,
                useSpeakerBoost: true,
            },
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
            settings: {
                stability: 0.42,
                similarityBoost: 0.83,
                style: 0.04,
                speed: 0.96,
                useSpeakerBoost: true,
            },
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
            settings: {
                stability: 0.45,
                similarityBoost: 0.82,
                style: 0.04,
                speed: 0.98,
                useSpeakerBoost: true,
            },
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
            settings: {
                stability: 0.53,
                similarityBoost: 0.84,
                style: 0.02,
                speed: 1,
                useSpeakerBoost: true,
            },
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
            settings: {
                stability: 0.5,
                similarityBoost: 0.85,
                style: 0.02,
                speed: 0.97,
                useSpeakerBoost: true,
            },
        },
    },
}

const LIVE_JOB_CACHE_TTL_MS = 30 * 60 * 1000
const LIVE_JOB_FETCH_TIMEOUT_MS = 12000
const DEFAULT_JOB_SEARCH_TERMS = [
    'software engineer',
    'frontend engineer',
    'backend engineer',
]
const TECH_JOB_KEYWORDS = [
    'software engineer',
    'frontend',
    'backend',
    'full stack',
    'fullstack',
    'developer',
    'devops',
    'site reliability',
    'platform engineer',
    'cloud engineer',
    'data engineer',
    'data scientist',
    'machine learning',
    'ml engineer',
    'ai engineer',
    'product manager',
    'product designer',
    'ux designer',
    'ui designer',
    'qa engineer',
    'automation',
    'security engineer',
    'mobile developer',
    'react',
    'typescript',
    'javascript',
    'node',
    'python',
    'aws',
    'docker',
    'kubernetes',
    'n8n',
    'api',
    'supabase',
    'postgres',
]
const EXCLUDED_JOB_KEYWORDS = [
    'academy',
    'bootcamp',
    'course',
    'certification',
    'training program',
    'weiterbildung',
    'ausbildung',
    'kurs',
    'qualification program',
]

const SAMPLE_JOBS: JobDocument[] = [
    {
        job_id: 'job-001',
        title: 'frontend engineer',
        company: 'Vercel',
        location: 'berlin',
        description: 'Build polished React and Next.js interfaces, collaborate with design, and improve developer velocity.',
        employment_type: 'full_time',
        seniority_level: 'mid',
        job_function: 'Frontend Engineer',
        industries: 'Developer Tools',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/frontend-vercel',
        posted_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
        job_id: 'job-002',
        title: 'backend engineer',
        company: 'Stripe',
        location: 'remote',
        description: 'Design APIs, build event-driven services, and improve reliability across payments infrastructure.',
        employment_type: 'full_time',
        seniority_level: 'mid',
        job_function: 'Backend Engineer',
        industries: 'Fintech',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/backend-stripe',
        posted_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
        job_id: 'job-003',
        title: 'full stack engineer',
        company: 'Notion',
        location: 'hybrid',
        description: 'Ship product features end to end with TypeScript, Node.js, and React while partnering closely with product.',
        employment_type: 'full_time',
        seniority_level: 'entry',
        job_function: 'Full Stack Engineer',
        industries: 'Productivity',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/fullstack-notion',
        posted_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
        job_id: 'job-004',
        title: 'data engineer',
        company: 'Databricks',
        location: 'dubai',
        description: 'Create resilient batch and streaming pipelines, optimize warehouse performance, and support analytics teams.',
        employment_type: 'full_time',
        seniority_level: 'mid',
        job_function: 'Data Engineer',
        industries: 'Data Platform',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/data-databricks',
        posted_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
        job_id: 'job-005',
        title: 'ui ux designer',
        company: 'Figma',
        location: 'remote',
        description: 'Craft end-to-end product experiences, create prototypes, and translate research insights into product decisions.',
        employment_type: 'contract',
        seniority_level: 'mid',
        job_function: 'UI/UX Designer',
        industries: 'Design Software',
        source: 'Behance',
        source_url: 'https://example.com/jobs/design-figma',
        posted_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        job_id: 'job-006',
        title: 'devops engineer',
        company: 'Cloudflare',
        location: 'hybrid',
        description: 'Automate cloud infrastructure, harden CI/CD, and improve observability for high-scale services.',
        employment_type: 'full_time',
        seniority_level: 'senior',
        job_function: 'DevOps Engineer',
        industries: 'Infrastructure',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/devops-cloudflare',
        posted_date: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
        job_id: 'job-007',
        title: 'software engineer intern',
        company: 'Shopify',
        location: 'remote',
        description: 'Join a product squad, contribute React and Ruby features, and learn production engineering workflows.',
        employment_type: 'internship',
        seniority_level: 'entry',
        job_function: 'Software Engineer',
        industries: 'E-commerce',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/intern-shopify',
        posted_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
        job_id: 'job-008',
        title: 'machine learning engineer',
        company: 'OpenAI',
        location: 'remote',
        description: 'Evaluate models, ship applied ML systems, and collaborate on reliable inference pipelines.',
        employment_type: 'full_time',
        seniority_level: 'senior',
        job_function: 'ML Engineer',
        industries: 'Artificial Intelligence',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/ml-openai',
        posted_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
        job_id: 'job-009',
        title: 'product manager',
        company: 'Atlassian',
        location: 'berlin',
        description: 'Own roadmap discovery, align engineering and design, and turn ambiguous customer needs into shippable bets.',
        employment_type: 'full_time',
        seniority_level: 'mid',
        job_function: 'Product Manager',
        industries: 'SaaS',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/pm-atlassian',
        posted_date: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
    {
        job_id: 'job-010',
        title: 'qa engineer',
        company: 'Canva',
        location: 'remote',
        description: 'Drive automated regression coverage, exploratory testing, and release quality for collaborative design tools.',
        employment_type: 'full_time',
        seniority_level: 'entry',
        job_function: 'QA Engineer',
        industries: 'Design Software',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/qa-canva',
        posted_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
        job_id: 'job-011',
        title: 'data scientist',
        company: 'Spotify',
        location: 'hybrid',
        description: 'Model user behavior, deliver experimentation insights, and communicate recommendations to product teams.',
        employment_type: 'full_time',
        seniority_level: 'mid',
        job_function: 'Data Scientist',
        industries: 'Media',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/ds-spotify',
        posted_date: new Date(Date.now() - 11 * 86400000).toISOString(),
    },
    {
        job_id: 'job-012',
        title: 'frontend engineer intern',
        company: 'Linear',
        location: 'remote',
        description: 'Support high-quality UI delivery with React, motion design, and component library contributions.',
        employment_type: 'internship',
        seniority_level: 'entry',
        job_function: 'Frontend Engineer',
        industries: 'Productivity',
        source: 'LinkedIn',
        source_url: 'https://example.com/jobs/frontend-linear',
        posted_date: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
]

@Injectable()
export class OnboardService {
    private readonly liveJobsCache = new Map<
        string,
        { expiresAt: number; jobs: JobDocument[] }
    >()

    constructor(
        private readonly prisma: PrismaService,
        private readonly interviewAiService: InterviewAiService,
    ) {}

    async health() {
        return {
            status: 'ok',
            service: 'onboard',
            timestamp: new Date().toISOString(),
        }
    }

    async extractText(file: Express.Multer.File | undefined) {
        if (!file) {
            throw new Error('A file is required.')
        }

        const text = await this.extractTextFromFile(file)
        return { text }
    }

    async getDashboard(sessionKey: string) {
        const profile = await this.getOrCreateProfile(sessionKey)
        const latestCv = await this.prisma.publicCv.findFirst({
            where: { sessionKey },
            orderBy: { createdAt: 'desc' },
        })
        const latestGuide = await this.prisma.publicCareerGuide.findFirst({
            where: { sessionKey },
            orderBy: { createdAt: 'desc' },
        })

        return {
            userName: profile.name || 'there',
            latestCV: latestCv
                ? {
                    id: latestCv.id,
                    job_title: latestCv.jobTitle,
                    final_score: latestCv.finalScore,
                    original_score: latestCv.originalScore,
                    created_at: latestCv.createdAt.toISOString(),
                }
                : null,
            latestGuide: latestGuide
                ? {
                    id: latestGuide.id,
                    current_job: latestGuide.currentJob,
                    target_job: latestGuide.targetJob,
                    readiness_score: latestGuide.readinessScore,
                    domain: latestGuide.domain,
                    created_at: latestGuide.createdAt.toISOString(),
                }
                : null,
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
            .map((job) => ({
                ...job,
                match_score: this.scoreJob(job, resumeContent ?? ''),
            }))
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
            message:
                withScores.length > 0
                    ? `Found ${withScores.length} live jobs matching your criteria.`
                    : this.buildNoJobsMessage(Boolean(resumeContent?.trim())),
        }
    }

    async matchJobs(resumeContent: string, limit = 200) {
        const liveJobs = await this.loadLiveJobs({}, resumeContent, limit)
        const matches = liveJobs
            .map((job) => ({
                ...job,
                match_score: this.scoreJob(job, resumeContent),
            }))
            .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
            .slice(0, limit)

        return {
            success: true,
            matches,
            total_found: matches.length,
            message:
                matches.length > 0
                    ? `Found ${matches.length} live matches.`
                    : this.buildNoJobsMessage(true),
            profile_summary: {
                primary_titles: this.extractRoleKeywords(resumeContent).slice(0, 3),
                key_skills: this.extractSkillKeywords(resumeContent).slice(0, 5),
                experience_level: resumeContent.toLowerCase().includes('senior')
                    ? 'senior'
                    : resumeContent.toLowerCase().includes('lead')
                      ? 'mid'
                      : 'entry',
            },
        }
    }

    async generateQuestions(
        sessionKey: string,
        cv: Express.Multer.File,
        jobDescriptions: Express.Multer.File[],
    ): Promise<AcceptedJob> {
        const cvText = await this.extractTextFromFile(cv)
        const jobsTextParts = await Promise.all(jobDescriptions.map((file) => this.extractTextFromFile(file)))
        const jobsText = jobsTextParts.join('\n\n')
        const role = this.detectRole(jobsText || cvText || 'software engineer')
        const questionCount = 4
        const questions = {
            question_1: `What project best demonstrates that you can succeed as a ${role}?`,
            question_2: `Which tools or technologies in your background map most directly to this ${role} role?`,
            question_3: `Tell us about a challenge you solved that shows ownership and collaboration.`,
            question_4: `What would you improve in your current resume to sound more targeted for this role?`,
        }

        const session = await this.prisma.publicCvQuestionSession.create({
            data: {
                sessionKey,
                status: 'OPEN',
                questionsJson: questions,
                metadata: {
                    question_count: questionCount,
                    role,
                    uploaded_jobs: jobDescriptions.length,
                },
                cvText,
                jobsText,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        })

        return this.buildAcceptedJob({
            feature: 'cv-rewriter',
            operation: 'questions',
            resourceId: session.id,
            resourceType: 'cv_question_sessions',
            message: 'Questions generated successfully.',
        })
    }

    async getCvQuestionSession(sessionKey: string, id: string) {
        const session = await this.prisma.publicCvQuestionSession.findFirst({
            where: { id, sessionKey },
        })

        if (!session) {
            throw new Error('Question session not found.')
        }

        return this.mapQuestionSession(session)
    }

    async listOpenCvQuestionSessions(sessionKey: string, limit = 50) {
        const sessions = await this.prisma.publicCvQuestionSession.findMany({
            where: { sessionKey, status: 'OPEN' },
            orderBy: { createdAt: 'desc' },
            take: limit,
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

        if (!session) {
            throw new Error('Question session not found.')
        }

        const originalScore = this.computeBaselineScore(session.cvText)
        const answerBoost = Math.min(18, answers.reduce((sum, item) => sum + item.answer.trim().split(/\s+/).length, 0) / 35)
        const finalScore = Math.min(98, Math.round((originalScore + 8 + answerBoost) * 10) / 10)
        const role = this.detectRole(session.jobsText || session.cvText || 'software engineer')
        const improvementNotes = [
            `Sharper role targeting for ${role} opportunities`,
            'Stronger impact statements with clearer outcomes',
            'Cleaner alignment between projects and job requirements',
            'More visible technical keywords for screening systems',
            'Improved professional summary and positioning',
        ]
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

        const pdfData = await this.createPdfDocument(`${role} CV Booster`, [
            { heading: 'Professional Summary', lines: [this.createProfessionalSummary(session.cvText, role)] },
            { heading: 'Answered Context', lines: answers.map((item) => `${item.question} ${item.answer}`) },
            { heading: 'Improvements Applied', lines: improvementNotes },
        ])

        const created = await this.prisma.publicCv.create({
            data: {
                sessionKey,
                questionSessionId,
                // TODO(cloudinary): upload pdfData buffer via CloudinaryStorageService and store URL here
                pdfUrl: '',
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
                where: { sessionKey },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ])

        return {
            cvs: cvs.map((cv) => this.mapCv(cv, baseUrl)),
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        }
    }

    async getCv(sessionKey: string, id: string, baseUrl: string) {
        const cv = await this.prisma.publicCv.findFirst({
            where: { id, sessionKey },
        })

        if (!cv) {
            throw new Error('CV not found.')
        }

        return this.mapCv(cv, baseUrl)
    }

    async deleteCv(sessionKey: string, id: string) {
        const cv = await this.prisma.publicCv.findFirst({
            where: { id, sessionKey },
        })
        if (!cv) {
            throw new Error('CV not found.')
        }

        await this.prisma.publicCv.delete({ where: { id } })
        return { success: true }
    }

    async downloadCv(sessionKey: string, id: string) {
        const cv = await this.prisma.publicCv.findFirst({
            where: { id, sessionKey },
        })

        if (!cv) {
            throw new Error('CV not found.')
        }

        return {
            filename: `${cv.jobTitle.replace(/\s+/g, '_')}_cv.pdf`,
            url: cv.pdfUrl,
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
    ): Promise<AcceptedJob> {
        const extractedCv = cvText?.trim()
            ? cvText.trim()
            : cvFile
              ? await this.extractTextFromFile(cvFile)
              : ''

        const currentStrengths = this.extractSkillKeywords(extractedCv).slice(0, 4)
        const skillsToLearn = this.buildSkillGaps(domain, targetJob ?? currentJob)
        const projectsToWorkOn = this.buildProjects(domain, targetJob ?? currentJob)
        const softSkillsToDevelop = ['Stakeholder communication', 'Prioritization', 'Clear technical storytelling']
        const careerRoadmap = [
            `Month 1: Tighten your ${currentJob} positioning around measurable outcomes.`,
            `Month 2: Build one portfolio-ready ${domain.toLowerCase()} project tailored to ${targetJob ?? currentJob}.`,
            'Month 3: Document your decision-making process and technical tradeoffs.',
            'Month 4: Practice interviews and sharpen concise project walkthroughs.',
            'Month 5+: Apply consistently and iterate based on recruiter feedback.',
        ]
        const readinessScore = Math.min(96, 58 + currentStrengths.length * 7 + (targetJob ? 8 : 0))

        const created = await this.prisma.publicCareerGuide.create({
            data: {
                sessionKey,
                currentStrengths: currentStrengths.length ? currentStrengths : ['Adaptability', 'Problem solving', 'Execution'],
                readinessScore,
                skillsToLearn,
                projectsToWorkOn,
                softSkillsToDevelop,
                careerRoadmap,
                domain,
                currentJob,
                targetJob,
            },
        })

        return this.buildAcceptedJob({
            feature: 'career-guide',
            operation: 'generate',
            resourceId: created.id,
            resourceType: 'career_guides',
            message: 'Career guide generated successfully.',
        })
    }

    async listCareerGuides(sessionKey: string, page: number, pageSize: number) {
        const [total, guides] = await Promise.all([
            this.prisma.publicCareerGuide.count({ where: { sessionKey } }),
            this.prisma.publicCareerGuide.findMany({
                where: { sessionKey },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ])

        return {
            guides: guides.map((guide) => this.mapCareerGuide(guide)),
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        }
    }

    async getCareerGuide(sessionKey: string, id: string) {
        const guide = await this.prisma.publicCareerGuide.findFirst({
            where: { id, sessionKey },
        })
        if (!guide) {
            throw new Error('Career guide not found.')
        }

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

    async generatePortfolio(
        sessionKey: string,
        request: {
            wireframe: string
            theme: string
            cv?: Express.Multer.File
            cvText?: string
            personalInfo?: Record<string, unknown>
            photoUrl?: string
        },
    ): Promise<AcceptedJob> {
        const profile = await this.getOrCreateProfile(sessionKey)
        const cvText = request.cvText?.trim()
            ? request.cvText.trim()
            : request.cv
              ? await this.extractTextFromFile(request.cv)
              : ''
        const personalInfo = request.personalInfo ?? {}
        const html = this.buildPortfolioHtml({
            profile,
            cvText,
            wireframe: request.wireframe,
            theme: request.theme,
            personalInfo,
            photoUrl: request.photoUrl,
        })

        const created = await this.prisma.publicPortfolioGeneration.create({
            data: {
                sessionKey,
                wireframe: request.wireframe,
                theme: request.theme,
                html,
            },
        })

        return this.buildAcceptedJob({
            feature: 'portfolio-builder',
            operation: 'generate',
            resourceId: created.id,
            resourceType: 'portfolio_generations',
            message: 'Portfolio generated successfully.',
        })
    }

    async listPortfolioGenerations(sessionKey: string, page: number, pageSize: number) {
        const [total, generations] = await Promise.all([
            this.prisma.publicPortfolioGeneration.count({ where: { sessionKey } }),
            this.prisma.publicPortfolioGeneration.findMany({
                where: { sessionKey },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ])

        return {
            generations: generations.map((generation) => ({
                id: generation.id,
                user_id: generation.sessionKey,
                job_id: generation.id,
                wireframe: generation.wireframe,
                theme: generation.theme,
                html: generation.html,
                created_at: generation.createdAt.toISOString(),
            })),
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        }
    }

    async getPortfolioGeneration(sessionKey: string, id: string) {
        const generation = await this.prisma.publicPortfolioGeneration.findFirst({
            where: { id, sessionKey },
        })

        if (!generation) {
            throw new Error('Portfolio generation not found.')
        }

        return {
            id: generation.id,
            user_id: generation.sessionKey,
            job_id: generation.id,
            wireframe: generation.wireframe,
            theme: generation.theme,
            html: generation.html,
            created_at: generation.createdAt.toISOString(),
        }
    }

    async startInterview(
        sessionKey: string,
        input: {
            personaKey?: string
            questionCount?: number
            company?: string
            jobTitle?: string
            jobDescription?: string
        },
    ) {
        const personaKey = input.personaKey && PERSONAS[input.personaKey]
            ? input.personaKey
            : 'alex_chen'
        const persona = PERSONAS[personaKey]
        const maxQuestions = Math.max(2, Math.min(5, input.questionCount ?? 3))
        const recruiterMode = this.mapPersonaToRecruiterMode(persona)
        const context: InterviewContext = {
            company: input.company ?? persona.company,
            jobTitle: input.jobTitle ?? persona.position,
            jobDescription:
                input.jobDescription ??
                `Interview practice for a ${input.jobTitle ?? persona.position} role.`,
        }
        const question = await this.generateOpeningQuestion(
            context,
            recruiterMode,
            persona,
            maxQuestions,
        )
        const openingAudio = await this.maybeGenerateInterviewAudio(
            question,
            recruiterMode,
            persona.voiceProfile,
        )

        const created = await this.prisma.publicInterview.create({
            data: {
                sessionKey,
                personaKey,
                status: 'IN_PROGRESS',
                interviewerName: persona.name,
                interviewerRole: persona.role,
                interviewStyle: persona.style,
                difficultyLevel: persona.difficulty,
                company: context.company,
                jobTitle: context.jobTitle,
                jobDescription: context.jobDescription,
                recruiterMode: recruiterMode,
                data: {
                    maxQuestions,
                    questions: [question],
                    answers: [],
                    turns: [],
                },
            },
        })

        return {
            interviewId: created.id,
            questionText: question,
            questionIndex: 1,
            interviewerName: persona.name,
            personaKey,
            audioBase64: openingAudio?.audioBase64,
            audioMime: openingAudio?.audioMime,
        }
    }

    async answerInterview(
        sessionKey: string,
        interviewId: string,
        input: {
            audio?: Express.Multer.File
            text?: string
        },
        baseUrl: string,
    ) {
        const interview = await this.prisma.publicInterview.findFirst({
            where: { id: interviewId, sessionKey },
        })

        if (!interview) {
            throw new Error('Interview not found.')
        }

        const persona = PERSONAS[interview.personaKey] ?? PERSONAS.alex_chen
        const data = (interview.data ?? {
            maxQuestions: 3,
            questions: [],
            answers: [],
            turns: [],
        }) as InterviewState
        const currentQuestion = data.questions[data.questions.length - 1]
        const questionAsked = currentQuestion || this.buildInterviewQuestion(
            persona,
            data.answers.length + 1,
            data.maxQuestions,
            interview.jobTitle ?? persona.position,
        )
        const recruiterMode = this.parseRecruiterMode(
            interview.recruiterMode,
            persona,
        )
        const context = this.buildInterviewContext(interview, persona)
        const transcript = await this.resolveInterviewTranscript(input)
        const evaluation = await this.evaluateInterviewAnswer(
            context,
            recruiterMode,
            persona,
            questionAsked,
            transcript,
            data,
        )
        const score = evaluation.score
        const feedback = evaluation.feedback
        const turn: InterviewTurn = {
            question: questionAsked,
            answer: transcript,
            score,
            feedback,
        }

        data.answers.push(transcript)
        data.turns.push(turn)

        const done =
            data.turns.length >= data.maxQuestions || !evaluation.nextQuestion
        if (!done) {
            const nextQuestion = evaluation.nextQuestion ?? this.buildInterviewQuestion(
                persona,
                data.turns.length + 1,
                data.maxQuestions,
                interview.jobTitle ?? persona.position,
            )
            data.questions.push(nextQuestion)
            const nextQuestionAudio = await this.maybeGenerateInterviewAudio(
                nextQuestion,
                recruiterMode,
                persona.voiceProfile,
            )

            await this.prisma.publicInterview.update({
                where: { id: interview.id },
                data: {
                    totalExchanges: data.turns.length,
                    data,
                    transcript: data.turns,
                },
            })

            return {
                done: false,
                transcript,
                feedback,
                questionText: nextQuestion,
                questionIndex: data.questions.length,
                audioBase64: nextQuestionAudio?.audioBase64,
                audioMime: nextQuestionAudio?.audioMime,
            }
        }

        const report = await this.finalizeInterview(interview.id, data, persona, baseUrl)
        return {
            done: true,
            transcript,
            feedback: report.summary,
            summary: report.summary,
            score: report.overall_score,
            reportId: report.id,
        }
    }

    async listInterviews(sessionKey: string, page: number, pageSize: number, baseUrl: string) {
        const [total, interviews] = await Promise.all([
            this.prisma.publicInterview.count({
                where: { sessionKey, status: 'COMPLETED' },
            }),
            this.prisma.publicInterview.findMany({
                where: { sessionKey, status: 'COMPLETED' },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ])

        return {
            interviews: interviews.map((item) => this.mapInterview(item, baseUrl)),
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        }
    }

    async getInterview(sessionKey: string, id: string, baseUrl: string) {
        const interview = await this.prisma.publicInterview.findFirst({
            where: { id, sessionKey, status: 'COMPLETED' },
        })
        if (!interview) {
            throw new Error('Interview not found.')
        }

        return this.mapInterview(interview, baseUrl)
    }

    async deleteInterview(sessionKey: string, id: string) {
        const interview = await this.prisma.publicInterview.findFirst({
            where: { id, sessionKey },
        })
        if (!interview) {
            throw new Error('Interview not found.')
        }

        await this.prisma.publicInterview.delete({ where: { id } })
        return { success: true }
    }

    async downloadInterviewPdf(sessionKey: string, id: string) {
        const interview = await this.prisma.publicInterview.findFirst({
            where: { id, sessionKey, status: 'COMPLETED' },
        })
        if (!interview || !interview.pdfUrl) {
            throw new Error('Interview PDF not found.')
        }

        return {
            filename: `interview-report-${id}.pdf`,
            url: interview.pdfUrl,
        }
    }

    private buildAcceptedJob(params: {
        feature: AcceptedJobFeature
        operation: AcceptedJobOperation
        resourceId: string
        resourceType: string
        message: string
    }): AcceptedJob {
        const now = new Date().toISOString()
        return {
            job_id: crypto.randomUUID(),
            status: 'COMPLETED',
            feature: params.feature,
            operation: params.operation,
            created_at: now,
            existing: false,
            resource_id: params.resourceId,
            resource_type: params.resourceType,
            message: params.message,
            progress: 100,
            phase: 'COMPLETED',
        }
    }

    private async getOrCreateProfile(sessionKey: string) {
        const existing = await this.prisma.publicSessionProfile.findUnique({
            where: { sessionKey },
        })
        if (existing) {
            return existing
        }

        return this.prisma.publicSessionProfile.create({
            data: {
                sessionKey,
                name: '',
                email: null,
                location: null,
                birthDate: null,
                targetedRole: null,
                organization: null,
                skills: [],
                education: [],
                experiences: [],
                achievements: [],
                githubUrl: null,
                linkedinUrl: null,
                twitterUrl: null,
                avatarUrl: null,
                profileCompleted: false,
                isDeactivated: false,
                deactivatedAt: null,
                subscription: 'Starter',
                subscriptionEndDate: null,
            },
        })
    }

    private async refreshProfileFromCv(sessionKey: string, cvText: string, role: string) {
        const profile = await this.getOrCreateProfile(sessionKey)
        const skills = this.extractSkillKeywords(cvText).slice(0, 6)

        await this.prisma.publicSessionProfile.update({
            where: { sessionKey },
            data: {
                targetedRole: role,
                skills: skills.length ? skills : profile.skills,
            },
        })
    }

    private buildPublicProfileUpdateData(input: PublicProfileUpdateInput) {
        return {
            ...(input.name !== undefined
                ? { name: this.normalizeProfileName(input.name) }
                : {}),
            ...(input.email !== undefined
                ? { email: this.toNullableString(input.email) }
                : {}),
            ...(input.location !== undefined
                ? { location: this.toNullableString(input.location) }
                : {}),
            ...(input.birthday !== undefined
                ? { birthDate: this.toNullableDate(input.birthday) }
                : {}),
            ...(input.targeted_role !== undefined
                ? { targetedRole: this.toNullableString(input.targeted_role) }
                : {}),
            ...(input.organization !== undefined
                ? { organization: this.toNullableString(input.organization) }
                : {}),
            ...(input.skills !== undefined
                ? { skills: this.toStringList(input.skills) }
                : {}),
            ...(input.education !== undefined
                ? { education: this.toStringList(input.education) }
                : {}),
            ...(input.experiences !== undefined
                ? { experiences: this.toStringList(input.experiences) }
                : {}),
            ...(input.achievements !== undefined
                ? { achievements: this.toStringList(input.achievements) }
                : {}),
            ...(input.github_url !== undefined
                ? { githubUrl: this.toNullableString(input.github_url) }
                : {}),
            ...(input.linkedin_url !== undefined
                ? { linkedinUrl: this.toNullableString(input.linkedin_url) }
                : {}),
            ...(input.twitter_url !== undefined
                ? { twitterUrl: this.toNullableString(input.twitter_url) }
                : {}),
            ...(input.avatar_url !== undefined
                ? { avatarUrl: this.toNullableString(input.avatar_url) }
                : {}),
            ...(input.profile_completed !== undefined
                ? { profileCompleted: Boolean(input.profile_completed) }
                : {}),
            ...(input.is_deactivated !== undefined
                ? { isDeactivated: Boolean(input.is_deactivated) }
                : {}),
            ...(input.deactivated_at !== undefined
                ? { deactivatedAt: this.toNullableDate(input.deactivated_at) }
                : {}),
            ...(input.subscription !== undefined
                ? { subscription: input.subscription || 'Starter' }
                : {}),
            ...(input.subscription_end_date !== undefined
                ? { subscriptionEndDate: this.toNullableDate(input.subscription_end_date) }
                : {}),
        }
    }

    private mapPublicProfile(profile: {
        id: string
        sessionKey: string
        name: string
        email: string | null
        location: string | null
        birthDate: Date | null
        targetedRole: string | null
        organization: string | null
        skills: string[]
        education: string[]
        experiences: string[]
        achievements: string[]
        githubUrl: string | null
        linkedinUrl: string | null
        twitterUrl: string | null
        avatarUrl: string | null
        profileCompleted: boolean
        isDeactivated: boolean
        deactivatedAt: Date | null
        subscription: string
        subscriptionEndDate: Date | null
        createdAt: Date
        updatedAt: Date
    }) {
        return {
            id: profile.sessionKey,
            session_key: profile.sessionKey,
            name: profile.name || null,
            email: profile.email,
            location: profile.location,
            birthday: this.toDateOnlyString(profile.birthDate),
            targeted_role: profile.targetedRole,
            organization: profile.organization,
            skills: profile.skills,
            education: profile.education,
            experiences: profile.experiences,
            achievements: profile.achievements,
            github_url: profile.githubUrl,
            linkedin_url: profile.linkedinUrl,
            twitter_url: profile.twitterUrl,
            avatar_url: profile.avatarUrl,
            profile_completed: profile.profileCompleted,
            profile_completion: this.calculatePublicProfileCompletion(profile),
            subscription: (profile.subscription || 'Starter') as 'Starter' | 'Achiever' | 'Expert',
            subscription_end_date: profile.subscriptionEndDate?.toISOString() ?? null,
            is_deactivated: profile.isDeactivated,
            deactivated_at: profile.deactivatedAt?.toISOString() ?? null,
            is_verified: true,
            last_login: null,
            created_at: profile.createdAt.toISOString(),
            updated_at: profile.updatedAt.toISOString(),
        }
    }

    private calculatePublicProfileCompletion(profile: {
        name: string
        location: string | null
        birthDate: Date | null
        githubUrl: string | null
        linkedinUrl: string | null
        twitterUrl: string | null
        targetedRole: string | null
        organization: string | null
        skills: string[]
        experiences: string[]
        education: string[]
        achievements: string[]
    }) {
        const fields = [
            profile.name,
            profile.location,
            profile.birthDate,
            profile.linkedinUrl,
            profile.githubUrl,
            profile.twitterUrl,
            profile.targetedRole,
            profile.organization,
            profile.skills,
            profile.experiences,
            profile.education,
            profile.achievements,
        ]

        const completed = fields.filter((value) => {
            if (Array.isArray(value)) {
                return value.length > 0
            }

            if (value instanceof Date) {
                return true
            }

            return typeof value === 'string'
                ? value.trim().length > 0
                : Boolean(value)
        }).length

        return Math.round((completed / fields.length) * 100)
    }

    private normalizeProfileName(value: string | null | undefined) {
        return this.toNullableString(value) ?? ''
    }

    private toNullableString(value: string | null | undefined) {
        if (typeof value !== 'string') {
            return null
        }

        const trimmed = value.trim()
        return trimmed ? trimmed : null
    }

    private toStringList(value: string[] | null | undefined) {
        if (!Array.isArray(value)) {
            return []
        }

        return this.uniqueStrings(value.map((item) => String(item)))
    }

    private toNullableDate(value: string | null | undefined) {
        if (!value) {
            return null
        }

        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date
    }

    private toDateOnlyString(value: Date | null) {
        return value ? value.toISOString().slice(0, 10) : null
    }

    private mapQuestionSession(session: {
        id: string
        status: string
        questionsJson: unknown
        metadata: unknown
        createdAt: Date
        updatedAt: Date
        expiresAt: Date | null
    }) {
        return {
            id: session.id,
            question_job_id: session.id,
            rewrite_job_id: null,
            status: session.status,
            questions_json: session.questionsJson as Record<string, string>,
            metadata: session.metadata as Record<string, unknown>,
            created_at: session.createdAt.toISOString(),
            updated_at: session.updatedAt.toISOString(),
            expires_at: session.expiresAt?.toISOString() ?? null,
        }
    }

    private mapCv(
        cv: {
            id: string
            sessionKey: string
            originalScore: number
            finalScore: number
            jobTitle: string
            jobsSummary: string
            reviewImprovements: string[]
            anonymizedCvText: string | null
            createdAt: Date
        },
        baseUrl: string,
    ) {
        return {
            id: cv.id,
            user_id: cv.sessionKey,
            pdf_url: `${baseUrl}/download_cv/${cv.id}`,
            original_score: cv.originalScore,
            final_score: cv.finalScore,
            job_title: cv.jobTitle,
            jobs_summary: cv.jobsSummary,
            review_improvements: cv.reviewImprovements,
            anonymized_cv_text: cv.anonymizedCvText,
            created_at: cv.createdAt.toISOString(),
        }
    }

    private mapCareerGuide(guide: {
        id: string
        sessionKey: string
        currentStrengths: string[]
        readinessScore: number
        skillsToLearn: string[]
        projectsToWorkOn: string[]
        softSkillsToDevelop: string[]
        careerRoadmap: string[]
        domain: string
        currentJob: string
        targetJob: string | null
        createdAt: Date
        updatedAt: Date
    }) {
        return {
            id: guide.id,
            user_id: guide.sessionKey,
            current_strengths: guide.currentStrengths,
            readiness_score: guide.readinessScore,
            skills_to_learn: guide.skillsToLearn,
            projects_to_work_on: guide.projectsToWorkOn,
            soft_skills_to_develop: guide.softSkillsToDevelop,
            career_roadmap: guide.careerRoadmap,
            domain: guide.domain,
            current_job: guide.currentJob,
            target_job: guide.targetJob,
            created_at: guide.createdAt.toISOString(),
            updated_at: guide.updatedAt.toISOString(),
        }
    }

    private mapInterview(
        interview: {
            id: string
            sessionKey: string
            interviewerName: string
            interviewerRole: string
            interviewStyle: string
            difficultyLevel: string
            totalExchanges: number
            overallScore: number
            technicalCompetency: number
            communicationSkills: number
            problemSolving: number
            culturalFit: number
            acceptanceProbability: number
            keyStrengths: string[]
            areasForImprovement: string[]
            recommendations: string[]
            nextSteps: string[]
            summary: string
            createdAt: Date
            updatedAt: Date
        },
        baseUrl: string,
    ) {
        return {
            id: interview.id,
            user_id: interview.sessionKey,
            interviewer_name: interview.interviewerName,
            interviewer_role: interview.interviewerRole,
            interview_style: interview.interviewStyle,
            difficulty_level: interview.difficultyLevel,
            total_exchanges: interview.totalExchanges,
            overall_score: interview.overallScore,
            technical_competency: interview.technicalCompetency,
            communication_skills: interview.communicationSkills,
            problem_solving: interview.problemSolving,
            cultural_fit: interview.culturalFit,
            acceptance_probability: interview.acceptanceProbability,
            key_strengths: interview.keyStrengths,
            areas_for_improvement: interview.areasForImprovement,
            recommendations: interview.recommendations,
            next_steps: interview.nextSteps,
            summary: interview.summary,
            pdf_url: `${baseUrl}/onboard/interviews/${interview.id}/pdf`,
            created_at: interview.createdAt.toISOString(),
            updated_at: interview.updatedAt.toISOString(),
        }
    }

    private buildPortfolioHtml(input: {
        profile: {
            name: string
            email: string | null
            location: string | null
            targetedRole: string | null
            skills: string[]
            education: string[]
            experiences: string[]
            achievements: string[]
            githubUrl: string | null
            linkedinUrl: string | null
            twitterUrl: string | null
            avatarUrl: string | null
        }
        cvText: string
        wireframe: string
        theme: string
        personalInfo: Record<string, unknown>
        photoUrl?: string
    }) {
        const profile = input.profile
        const mergedSkills = this.uniqueStrings([
            ...profile.skills,
            ...(Array.isArray(input.personalInfo.skills)
                ? input.personalInfo.skills.map((value) => String(value))
                : []),
        ]).slice(0, 8)
        const experiences = this.collectListField(input.personalInfo.experiences, profile.experiences)
        const education = this.collectListField(input.personalInfo.education, profile.education)
        const achievements = this.collectListField(input.personalInfo.achievements, profile.achievements)
        const summary = this.createProfessionalSummary(
            input.cvText || JSON.stringify(input.personalInfo),
            profile.targetedRole || 'Software Engineer',
        )
        const accent = this.resolvePortfolioAccent(input.theme)
        const photoUrl = input.photoUrl || profile.avatarUrl

        const renderList = (items: string[]) =>
            items.length
                ? items.map((item) => `<li>${this.escapeHtml(item)}</li>`).join('')
                : '<li>Content coming soon.</li>'

        const socials = [
            profile.githubUrl ? `<a href="${this.escapeHtml(profile.githubUrl)}" target="_blank" rel="noreferrer">GitHub</a>` : '',
            profile.linkedinUrl ? `<a href="${this.escapeHtml(profile.linkedinUrl)}" target="_blank" rel="noreferrer">LinkedIn</a>` : '',
            profile.twitterUrl ? `<a href="${this.escapeHtml(profile.twitterUrl)}" target="_blank" rel="noreferrer">X</a>` : '',
        ]
            .filter(Boolean)
            .join(' · ')

        return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.escapeHtml(profile.name)} Portfolio</title>
    <style>
      :root {
        --accent: ${accent};
        --bg: #f7f7fb;
        --card: #ffffff;
        --text: #121826;
        --muted: #5b6475;
        --border: #d8dce6;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background:
          radial-gradient(circle at top left, rgba(255,255,255,0.9), transparent 35%),
          linear-gradient(135deg, #eef2ff, var(--bg));
        color: var(--text);
      }

      .page {
        max-width: 1080px;
        margin: 0 auto;
        padding: 48px 24px 64px;
      }

      .hero {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 24px;
        align-items: center;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 28px;
        padding: 32px;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
      }

      .avatar {
        width: 140px;
        height: 140px;
        border-radius: 24px;
        overflow: hidden;
        background: linear-gradient(135deg, var(--accent), #ffffff);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 42px;
        font-weight: 700;
      }

      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      h1, h2, h3, p { margin: 0; }
      h1 { font-size: 40px; line-height: 1.05; }
      h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); }
      h3 { font-size: 20px; margin-bottom: 14px; }

      .lede {
        margin-top: 14px;
        color: var(--muted);
        font-size: 17px;
        line-height: 1.7;
      }

      .meta {
        margin-top: 18px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        color: var(--muted);
        font-size: 14px;
      }

      .chip {
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        background: rgba(255,255,255,0.7);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
        margin-top: 24px;
      }

      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 22px;
        padding: 24px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
      }

      ul {
        margin: 0;
        padding-left: 18px;
        color: var(--muted);
        line-height: 1.7;
      }

      .skills {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .skill {
        padding: 10px 14px;
        border-radius: 14px;
        background: rgba(79, 70, 229, 0.08);
        color: var(--text);
        font-size: 14px;
        font-weight: 600;
      }

      .footer {
        margin-top: 24px;
        text-align: center;
        color: var(--muted);
        font-size: 14px;
      }

      a {
        color: inherit;
        text-decoration: none;
        border-bottom: 1px solid rgba(0,0,0,0.15);
      }

      @media (max-width: 760px) {
        .hero { grid-template-columns: 1fr; text-align: center; }
        .avatar { margin: 0 auto; }
        .grid { grid-template-columns: 1fr; }
        .meta, .skills { justify-content: center; }
      }
    </style>
  </head>
  <body>
    <main class="page" data-wireframe="${this.escapeHtml(input.wireframe)}" data-theme="${this.escapeHtml(input.theme)}">
      <section class="hero">
        <div class="avatar">
          ${photoUrl
                ? `<img src="${this.escapeHtml(photoUrl)}" alt="${this.escapeHtml(profile.name)}" />`
                : this.escapeHtml(
                    profile.name
                        .split(' ')
                        .map((part) => part.charAt(0))
                        .join('')
                        .slice(0, 2)
                        .toUpperCase(),
                )}
        </div>
        <div>
          <h2>${this.escapeHtml(profile.targetedRole || 'Professional Portfolio')}</h2>
          <h1>${this.escapeHtml(profile.name)}</h1>
          <p class="lede">${this.escapeHtml(summary)}</p>
          <div class="meta">
            ${profile.location ? `<span class="chip">${this.escapeHtml(profile.location)}</span>` : ''}
            ${profile.email ? `<span class="chip">${this.escapeHtml(profile.email)}</span>` : ''}
            ${socials ? `<span class="chip">${socials}</span>` : ''}
          </div>
        </div>
      </section>

      <section class="grid">
        <article class="card">
          <h3>Core Skills</h3>
          <div class="skills">
            ${mergedSkills.length
                ? mergedSkills.map((skill) => `<span class="skill">${this.escapeHtml(skill)}</span>`).join('')
                : '<span class="skill">Professional communication</span>'}
          </div>
        </article>

        <article class="card">
          <h3>Key Achievements</h3>
          <ul>${renderList(achievements)}</ul>
        </article>

        <article class="card">
          <h3>Experience Highlights</h3>
          <ul>${renderList(experiences)}</ul>
        </article>

        <article class="card">
          <h3>Education</h3>
          <ul>${renderList(education)}</ul>
        </article>
      </section>

      <p class="footer">
        Generated from the ${this.escapeHtml(input.wireframe)} wireframe with a ${this.escapeHtml(input.theme)} theme.
      </p>
    </main>
  </body>
</html>`
    }

    private async loadLiveJobs(
        filters: JobSearchFilters,
        resumeContent?: string,
        limit = 200,
    ) {
        const searchTerms = this.buildJobSearchQueries(filters, resumeContent)
        const remotiveLimit = Math.min(Math.max(limit, 24), 60)
        const providerRequests = [
            ...searchTerms.map((term) => this.fetchRemotiveJobs(term, remotiveLimit)),
            this.fetchArbeitnowJobs(),
        ]

        const settled = await Promise.allSettled(providerRequests)
        const liveJobs = settled.flatMap((result) =>
            result.status === 'fulfilled' ? result.value : [],
        )

        return this.dedupeJobs(liveJobs).filter(
            (job) =>
                this.isTechRelevantJob(job) &&
                !this.isExcludedJobListing(job),
        )
    }

    private buildJobSearchQueries(
        filters: JobSearchFilters,
        resumeContent?: string,
    ) {
        const roleQueries = this.uniqueStrings([
            ...(filters.job_functions ?? []),
            ...(resumeContent ? this.extractRoleKeywords(resumeContent) : []),
            ...(resumeContent?.trim() ? [this.detectRole(resumeContent)] : []),
        ])
        const skillQueries = this.uniqueStrings([
            ...(filters.required_skills ?? []),
            ...(resumeContent ? this.extractSkillKeywords(resumeContent) : []),
        ])

        const combined = [
            ...roleQueries.slice(0, 2),
            ...(skillQueries.length > 0 ? [skillQueries.slice(0, 3).join(' ')] : []),
        ]

        const queries = this.uniqueStrings(
            combined.length > 0 ? combined : DEFAULT_JOB_SEARCH_TERMS,
        )

        return queries.slice(0, 3)
    }

    private async fetchRemotiveJobs(searchTerm: string, limit: number) {
        const normalizedSearch = searchTerm.trim().toLowerCase()
        const cacheKey = `remotive:${normalizedSearch}:${limit}`

        return this.fetchJobFeedWithCache(cacheKey, async () => {
            const url = new URL('https://remotive.com/api/remote-jobs')
            url.searchParams.set('limit', String(limit))
            url.searchParams.set('search', searchTerm)

            const payload = await this.fetchJson<{ jobs?: RemotiveJobRecord[] }>(
                url.toString(),
            )

            return (payload.jobs ?? [])
                .map((job) => this.mapRemotiveJob(job))
                .filter((job): job is JobDocument => Boolean(job))
        })
    }

    private async fetchArbeitnowJobs() {
        return this.fetchJobFeedWithCache('arbeitnow:page:1', async () => {
            const url = new URL('https://www.arbeitnow.com/api/job-board-api')
            url.searchParams.set('page', '1')
            url.searchParams.set('limit', '100')

            const payload = await this.fetchJson<{ data?: ArbeitnowJobRecord[] }>(
                url.toString(),
            )

            return (payload.data ?? [])
                .map((job) => this.mapArbeitnowJob(job))
                .filter((job): job is JobDocument => Boolean(job))
        })
    }

    private async fetchJobFeedWithCache(
        cacheKey: string,
        loader: () => Promise<JobDocument[]>,
    ) {
        const cached = this.liveJobsCache.get(cacheKey)
        if (cached && cached.expiresAt > Date.now()) {
            return cached.jobs
        }

        const jobs = await loader()
        this.liveJobsCache.set(cacheKey, {
            expiresAt: Date.now() + LIVE_JOB_CACHE_TTL_MS,
            jobs,
        })

        return jobs
    }

    private async fetchJson<T>(url: string): Promise<T> {
        const controller = new AbortController()
        const timeoutId = setTimeout(
            () => controller.abort(),
            LIVE_JOB_FETCH_TIMEOUT_MS,
        )

        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
                signal: controller.signal,
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}`)
            }

            return (await response.json()) as T
        } finally {
            clearTimeout(timeoutId)
        }
    }

    private mapRemotiveJob(job: RemotiveJobRecord): JobDocument | null {
        if (!job.id || !job.url || !job.title || !job.company_name) {
            return null
        }

        const description = this.stripHtml(job.description || '')
        const location = job.candidate_required_location?.trim()
            ? `Remote - ${job.candidate_required_location.trim()}`
            : 'Remote'

        return {
            job_id: `remotive-${job.id}`,
            title: job.title,
            company: job.company_name,
            location,
            work_model: 'remote',
            description,
            employment_type: this.normalizeEmploymentType(job.job_type),
            seniority_level: this.detectSeniorityLevel(
                `${job.title} ${description}`,
            ),
            job_function:
                this.inferJobFunction(`${job.title} ${description}`) || 'Technology',
            industries: job.category || 'Remote',
            salary: job.salary?.trim() || undefined,
            company_logo_url:
                job.company_logo_url?.trim() || job.company_logo?.trim() || undefined,
            source: 'Remotive',
            source_url: job.url,
            posted_date: job.publication_date
                ? new Date(job.publication_date).toISOString()
                : new Date().toISOString(),
        }
    }

    private mapArbeitnowJob(job: ArbeitnowJobRecord): JobDocument | null {
        if (!job.slug || !job.url || !job.title || !job.company_name) {
            return null
        }

        const description = this.stripHtml(job.description || '')
        const rawTypes = job.job_types ?? []
        const workModel = this.detectWorkModel(
            job.remote === true,
            `${job.title} ${description} ${rawTypes.join(' ')}`,
        )
        const location =
            workModel === 'remote'
                ? job.location?.trim()
                    ? `${job.location.trim()} / Remote`
                    : 'Remote'
                : job.location?.trim() || 'On-site'

        return {
            job_id: `arbeitnow-${job.slug}`,
            title: job.title,
            company: job.company_name,
            location,
            work_model: workModel,
            description,
            employment_type: this.normalizeEmploymentType(rawTypes),
            seniority_level: this.detectSeniorityLevel(
                `${job.title} ${description} ${rawTypes.join(' ')}`,
            ),
            job_function:
                this.inferJobFunction(`${job.title} ${description}`) || 'Technology',
            industries:
                (job.tags ?? []).find((tag) => tag.toLowerCase() !== 'remote') ||
                'Technology',
            source: 'Arbeitnow',
            source_url: job.url,
            posted_date: job.created_at
                ? new Date(job.created_at * 1000).toISOString()
                : new Date().toISOString(),
        }
    }

    private normalizeEmploymentType(value: string | string[] | undefined) {
        const normalized = Array.isArray(value) ? value.join(' ') : value || ''
        const text = normalized.toLowerCase()

        if (
            text.includes('intern') ||
            text.includes('graduate') ||
            text.includes('working student')
        ) {
            return 'internship'
        }

        if (text.includes('part') || text.includes('teilzeit')) {
            return 'part_time'
        }

        if (
            text.includes('contract') ||
            text.includes('freelance') ||
            text.includes('consult')
        ) {
            return text.includes('freelance') ? 'freelance' : 'contract'
        }

        return 'full_time'
    }

    private detectWorkModel(isRemote: boolean, text: string) {
        if (isRemote) {
            return 'remote'
        }

        const normalized = text.toLowerCase()
        if (normalized.includes('hybrid')) {
            return 'hybrid'
        }

        return 'onsite'
    }

    private detectSeniorityLevel(text: string) {
        const normalized = text.toLowerCase()
        if (
            normalized.includes('senior') ||
            normalized.includes('lead') ||
            normalized.includes('principal') ||
            normalized.includes('staff') ||
            normalized.includes('manager') ||
            normalized.includes('director') ||
            normalized.includes('head of')
        ) {
            return 'senior'
        }

        if (
            normalized.includes('intern') ||
            normalized.includes('junior') ||
            normalized.includes('entry') ||
            normalized.includes('graduate') ||
            normalized.includes('working student')
        ) {
            return 'entry'
        }

        return 'mid'
    }

    private inferJobFunction(text: string) {
        const normalized = text.toLowerCase()
        const exactRole = this.extractRoleKeywords(normalized)[0]

        if (exactRole) {
            return this.toTitle(exactRole)
        }

        if (normalized.includes('qa engineer') || normalized.includes('quality assurance')) {
            return 'QA Engineer'
        }

        if (
            normalized.includes('devops') ||
            normalized.includes('site reliability') ||
            normalized.includes('sre')
        ) {
            return 'Devops Engineer'
        }

        if (
            normalized.includes('frontend') ||
            normalized.includes('front end')
        ) {
            return 'Frontend Engineer'
        }

        if (
            normalized.includes('backend') ||
            normalized.includes('back end')
        ) {
            return 'Backend Engineer'
        }

        if (
            normalized.includes('fullstack') ||
            normalized.includes('full stack')
        ) {
            return 'Full Stack Engineer'
        }

        if (
            normalized.includes('designer') &&
            (normalized.includes('ux') || normalized.includes('ui') || normalized.includes('product'))
        ) {
            return 'UI UX Designer'
        }

        if (normalized.includes('product manager')) {
            return 'Product Manager'
        }

        if (
            normalized.includes('data engineer') ||
            normalized.includes('analytics engineer')
        ) {
            return 'Data Engineer'
        }

        if (normalized.includes('data scientist')) {
            return 'Data Scientist'
        }

        if (
            normalized.includes('machine learning') ||
            normalized.includes('ml engineer')
        ) {
            return 'Ml Engineer'
        }

        if (
            normalized.includes('software engineer') ||
            normalized.includes('developer') ||
            normalized.includes('programmer')
        ) {
            return 'Software Engineer'
        }

        return ''
    }

    private dedupeJobs(jobs: JobDocument[]) {
        const seen = new Set<string>()

        return jobs.filter((job) => {
            const key = `${job.source_url}|${job.title.toLowerCase()}|${job.company.toLowerCase()}`
            if (seen.has(key)) {
                return false
            }

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
        return EXCLUDED_JOB_KEYWORDS.some((keyword) =>
            haystack.includes(keyword),
        )
    }

    private stripHtml(value: string) {
        return value
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&#x26;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/\s+/g, ' ')
            .trim()
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

        const includesValue = (values: string[] | undefined, target: string) =>
            !values || values.length === 0 || values.some((value) => target.toLowerCase().includes(value.toLowerCase()))

        return (
            postedRecentlyEnough &&
            includesValue(filters.job_functions, job.job_function) &&
            includesValue(filters.job_types, job.employment_type) &&
            includesValue(filters.work_models, job.work_model || job.location) &&
            includesValue(filters.experience_levels, job.seniority_level) &&
            includesValue(filters.locations, job.location) &&
            (!filters.required_skills || filters.required_skills.length === 0 ||
                filters.required_skills.some((skill) =>
                    `${job.title} ${job.description} ${job.industries || ''}`.toLowerCase().includes(skill.toLowerCase()),
                ))
        )
    }

    private scoreJob(job: JobDocument, resumeContent: string) {
        if (!resumeContent.trim()) {
            const daysOld = Math.max(
                0,
                Math.floor((Date.now() - new Date(job.posted_date).getTime()) / 86400000),
            )
            return Math.max(55, 92 - daysOld * 4)
        }

        const haystack = `${job.title} ${job.description} ${job.job_function} ${job.industries}`.toLowerCase()
        const tokens = this.tokenize(resumeContent).slice(0, 18)
        const matches = tokens.filter((token) => haystack.includes(token)).length
        const preferredRole = this.extractRoleKeywords(resumeContent)[0]
        const roleHits = this.extractRoleKeywords(resumeContent).filter((role) =>
            haystack.includes(role.toLowerCase()),
        ).length
        const roleAlignmentBoost = preferredRole
            ? haystack.includes(preferredRole.toLowerCase())
                ? 12
                : -8
            : 0
        return Math.max(
            52,
            Math.min(99, 54 + matches * 5 + roleHits * 7 + roleAlignmentBoost),
        )
    }

    private extractRoleKeywords(text: string) {
        const roles = ['frontend engineer', 'backend engineer', 'full stack engineer', 'software engineer', 'data engineer', 'data scientist', 'ml engineer', 'product manager', 'ui ux designer']
        const normalized = text.toLowerCase()
        return roles.filter((role) => normalized.includes(role))
    }

    private extractSkillKeywords(text: string) {
        const skills = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Next.js', 'Prisma', 'NestJS', 'PostgreSQL', 'Python', 'Docker', 'AWS', 'Kubernetes', 'Figma', 'Machine Learning', 'Supabase', 'GraphQL', 'Tailwind']
        const normalized = text.toLowerCase()
        return skills.filter((skill) => normalized.includes(skill.toLowerCase()))
    }

    private buildSkillGaps(domain: string, targetRole: string) {
        const seed = `${domain} ${targetRole}`.toLowerCase()
        const gaps = ['System design', 'Stakeholder communication', 'Testing strategy', 'Performance optimization', 'Portfolio storytelling']
        if (seed.includes('data')) {
            return ['SQL modeling', 'Analytics communication', 'Production pipelines', 'Data quality monitoring']
        }
        if (seed.includes('design')) {
            return ['Research synthesis', 'Interaction prototyping', 'Design systems', 'Product metrics']
        }
        return gaps
    }

    private buildProjects(domain: string, targetRole: string) {
        const base = `${domain} ${targetRole}`.toLowerCase()
        if (base.includes('data')) {
            return [
                'Build an end-to-end analytics dashboard with ETL automation',
                'Create a streaming pipeline with quality checks and alerting',
                'Publish a forecasting project with clear business recommendations',
            ]
        }

        if (base.includes('design')) {
            return [
                'Redesign a complex workflow and document the case study',
                'Create a small design system with tokens and reusable components',
                'Prototype a mobile-first onboarding flow and test it with users',
            ]
        }

        return [
            'Ship a portfolio-ready product with authentication and deployment',
            'Build a feature-rich dashboard with charts, forms, and role-based flows',
            'Create a polished side project tailored to the jobs you want next',
        ]
    }

    private detectRole(text: string) {
        const roles = ['frontend engineer', 'backend engineer', 'full stack engineer', 'software engineer', 'data engineer', 'data scientist', 'devops engineer', 'product manager', 'ui ux designer', 'ml engineer']
        const normalized = text.toLowerCase()
        const found = roles.find((role) => normalized.includes(role))
        return found ? this.toTitle(found) : 'Software Engineer'
    }

    private summarizeText(text: string) {
        const cleaned = text.replace(/\s+/g, ' ').trim()
        if (!cleaned) {
            return 'Targeted resume rewrite generated from the uploaded role context.'
        }

        return cleaned.length > 220 ? `${cleaned.slice(0, 217)}...` : cleaned
    }

    private createProfessionalSummary(cvText: string, role: string) {
        const skills = this.extractSkillKeywords(cvText)
        const skillText = skills.length ? skills.slice(0, 4).join(', ') : 'modern product development'
        return `Results-oriented ${role} candidate with experience in ${skillText}, strong execution habits, and a clear focus on measurable user impact.`
    }

    private collectListField(value: unknown, fallback: string[]) {
        if (!value) {
            return fallback
        }

        if (Array.isArray(value)) {
            return this.uniqueStrings(value.map((item) => String(item)))
        }

        if (typeof value === 'string') {
            return this.uniqueStrings(
                value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
            )
        }

        return fallback
    }

    private uniqueStrings(values: string[]) {
        return Array.from(
            new Set(values.map((value) => value.trim()).filter(Boolean)),
        )
    }

    private resolvePortfolioAccent(theme: string) {
        const normalized = theme.toLowerCase()
        if (normalized.includes('minimal')) return '#0f766e'
        if (normalized.includes('creative')) return '#db2777'
        if (normalized.includes('dynamic')) return '#2563eb'
        if (normalized.includes('elegant')) return '#7c3aed'
        return '#4f46e5'
    }

    private escapeHtml(value: string) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
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

        if (tone.includes('support') || tone.includes('warm')) {
            return RecruiterMode.EMPATHIC
        }

        if (
            tone.includes('direct') ||
            tone.includes('sharp') ||
            tone.includes('fast-paced')
        ) {
            return RecruiterMode.DIRECT
        }

        if (
            style.includes('architecture') ||
            style.includes('systems') ||
            style.includes('technical') ||
            style.includes('machine learning') ||
            style.includes('data')
        ) {
            return RecruiterMode.TECHNICAL
        }

        return RecruiterMode.EMPATHIC
    }

    private parseRecruiterMode(
        storedMode: string | null | undefined,
        persona: PersonaRecord,
    ): RecruiterMode {
        if (storedMode === RecruiterMode.EMPATHIC) return RecruiterMode.EMPATHIC
        if (storedMode === RecruiterMode.TECHNICAL) return RecruiterMode.TECHNICAL
        if (storedMode === RecruiterMode.DIRECT) return RecruiterMode.DIRECT
        return this.mapPersonaToRecruiterMode(persona)
    }

    private buildInterviewContext(
        interview: {
            company: string | null
            jobTitle: string | null
            jobDescription: string | null
        },
        persona: PersonaRecord,
    ): InterviewContext {
        return {
            company: interview.company || persona.company,
            jobTitle: interview.jobTitle || persona.position,
            jobDescription:
                interview.jobDescription ||
                `Interview practice for a ${interview.jobTitle || persona.position} role.`,
        }
    }

    private async generateOpeningQuestion(
        context: InterviewContext,
        recruiterMode: RecruiterMode,
        persona: PersonaRecord,
        maxQuestions: number,
    ) {
        try {
            return await this.interviewAiService.generateQuestion(
                context,
                recruiterMode,
                [],
                1,
                maxQuestions,
            )
        } catch {
            return this.buildInterviewQuestion(
                persona,
                1,
                maxQuestions,
                context.jobTitle || persona.position,
            )
        }
    }

    private async maybeGenerateInterviewAudio(
        text: string,
        recruiterMode: RecruiterMode,
        voiceProfile?: InterviewVoiceProfile,
    ) {
        try {
            return await this.interviewAiService.textToSpeech(
                text,
                recruiterMode,
                voiceProfile,
            )
        } catch {
            return null
        }
    }

    private async resolveInterviewTranscript(input: {
        audio?: Express.Multer.File
        text?: string
    }) {
        const typed = input.text?.trim()
        if (typed) {
            return typed
        }

        if (input.audio) {
            try {
                return await this.interviewAiService.transcribeAudio(input.audio)
            } catch {
                return `Voice response received (${input.audio.originalname || 'recording'})`
            }
        }

        return 'Voice response received.'
    }

    private async evaluateInterviewAnswer(
        context: InterviewContext,
        recruiterMode: RecruiterMode,
        persona: PersonaRecord,
        currentQuestion: string,
        transcript: string,
        data: InterviewState,
    ) {
        try {
            const evaluation = await this.interviewAiService.evaluateAnswer(
                context,
                recruiterMode,
                currentQuestion,
                transcript,
                data.answers.length + 1,
                data.maxQuestions,
                data.turns.map((turn) => ({
                    question: turn.question,
                    answer: turn.answer,
                })),
            )

            return {
                score: Math.max(
                    0,
                    Math.min(100, Math.round(Number(evaluation.scores.overall) * 10)),
                ),
                feedback: evaluation.feedback,
                nextQuestion: evaluation.nextQuestion,
            }
        } catch {
            const score = this.computeInterviewAnswerScore(transcript, persona)
            const nextQuestion =
                data.answers.length + 1 >= data.maxQuestions
                    ? null
                    : this.buildInterviewQuestion(
                          persona,
                          data.answers.length + 2,
                          data.maxQuestions,
                          context.jobTitle || persona.position,
                      )

            return {
                score,
                feedback: this.buildInterviewFeedback(score, persona),
                nextQuestion,
            }
        }
    }

    private computeInterviewAnswerScore(answer: string, persona: PersonaRecord) {
        const words = answer.trim().split(/\s+/).filter(Boolean).length
        const specificityBoost = /(impact|latency|users|revenue|performance|system|delivery|design|data)/i.test(answer) ? 12 : 0
        const difficultyBoost = persona.difficulty.toLowerCase().includes('advanced') ? -4 : persona.difficulty.toLowerCase().includes('entry') ? 6 : 0
        return Math.max(48, Math.min(97, 52 + Math.min(24, words) + specificityBoost + difficultyBoost))
    }

    private buildInterviewFeedback(score: number, persona: PersonaRecord) {
        if (score >= 85) {
            return `${persona.name} would likely see this as a confident, high-signal answer with good ownership.`
        }
        if (score >= 70) {
            return `Solid answer. Tighten the structure and add one sharper outcome or metric to make it stronger.`
        }
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
        const keyStrengths = [
            'Clear ownership of project work',
            'Good alignment with the target role',
            'Willingness to reflect on tradeoffs',
        ]
        const areasForImprovement = [
            'Use more metrics or concrete impact where possible',
            'Lead with the result sooner in each answer',
            'Keep answers tighter under time pressure',
        ]
        const recommendations = [
            'Prepare two polished project walkthroughs with measurable outcomes',
            'Practice concise STAR-style answers for collaboration questions',
            'Highlight technical choices and the reason behind them',
        ]
        const nextSteps = [
            'Rehearse your top three stories out loud',
            'Refine one answer with stronger business impact',
            'Run another practice round with a different persona',
        ]
        const pdfData = await this.createPdfDocument(`${persona.name} Interview Report`, [
            { heading: 'Summary', lines: [summary] },
            { heading: 'Key Strengths', lines: keyStrengths },
            { heading: 'Areas For Improvement', lines: areasForImprovement },
            { heading: 'Recommendations', lines: recommendations },
            { heading: 'Next Steps', lines: nextSteps },
        ])

        const updated = await this.prisma.publicInterview.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                totalExchanges: data.turns.length,
                overallScore,
                technicalCompetency: technical,
                communicationSkills: communication,
                problemSolving,
                culturalFit,
                acceptanceProbability,
                keyStrengths,
                areasForImprovement,
                recommendations,
                nextSteps,
                summary,
                transcript: data.turns,
                data,
                // TODO(cloudinary): upload pdfData buffer via CloudinaryStorageService and store URL here
                pdfUrl: '',
            },
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
                if (text) {
                    return text
                }
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

        page.drawText(title, {
            x: 48,
            y,
            size: 20,
            font: bold,
            color: rgb(0.09, 0.14, 0.24),
        })
        y -= 30

        for (const section of sections) {
            page.drawText(section.heading, {
                x: 48,
                y,
                size: 13,
                font: bold,
                color: rgb(0.12, 0.24, 0.52),
            })
            y -= 18

            for (const line of section.lines) {
                const wrapped = this.wrapText(line, 80)
                for (const item of wrapped) {
                    if (y < 60) {
                        break
                    }
                    page.drawText(item, {
                        x: 56,
                        y,
                        size: 11,
                        font,
                        color: rgb(0.15, 0.18, 0.2),
                    })
                    y -= 14
                }
                y -= 4
            }

            y -= 8
        }

        return Buffer.from(await pdf.save())
    }

    private wrapText(text: string, maxChars: number) {
        const words = text.split(/\s+/)
        const lines: string[] = []
        let current = ''

        for (const word of words) {
            const next = current ? `${current} ${word}` : word
            if (next.length > maxChars) {
                if (current) lines.push(current)
                current = word
            } else {
                current = next
            }
        }

        if (current) lines.push(current)
        return lines
    }

    private tokenize(text: string) {
        return Array.from(new Set(
            text
                .toLowerCase()
                .replace(/[^a-z0-9\s.+#-]/g, ' ')
                .split(/\s+/)
                .map((token) => token.trim())
                .filter((token) => token.length > 2),
        ))
    }

    private toTitle(value: string) {
        return value
            .split(' ')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
    }
}
