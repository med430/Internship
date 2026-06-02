import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import pdfParse from 'pdf-parse'
import { PrismaService } from '../../../Infrastructure/Persistence/prisma/prisma.service'
import { IUserRepository } from '../../../Application/repositories/user.repository'
import { IStudentProfileRepository } from '../../../Application/repositories/student-profile.repository'
import { ICVRepository } from '../../../Application/repositories/cv.repository'
import { ISkillRepository } from '../../../Application/repositories/skill.repository'
import { CV } from '../../../Domain/entities/cv.entity'
import { SkillLevel } from '../../../Domain/enums/skill-level.enum'
import { UpdateStudentProfileCommand } from '../../../Application/Features/ProfileFeature/Commands/update-student-profile.command'

type ParsedEducation = {
    school?: string | null
    degree?: string | null
    field?: string | null
    startDate?: string | null
    endDate?: string | null
    description?: string | null
}

type ParsedExperience = {
    company?: string | null
    role?: string | null
    startDate?: string | null
    endDate?: string | null
    description?: string | null
}

type ParsedCertification = {
    name?: string | null
    organization?: string | null
    issueDate?: string | null
    expirationDate?: string | null
    credentialId?: string | null
    credentialUrl?: string | null
}

type ImportedCvAnalysis = {
    fullName?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    phone?: string | null
    location?: string | null
    summary?: string | null
    targetRole?: string | null
    mainDomain?: string | null
    experienceLevel?: 'junior' | 'mid' | 'senior' | null
    dominantStack?: string[]
    skills?: string[]
    languages?: string[]
    certifications?: string[]
    preferredDomains?: string[]
    preferredOfferTypes?: Array<'INTERNSHIP' | 'PFE' | 'RESEARCH' | 'PHD' | 'ALTERNANCE'>
    preferredCities?: string[]
    preferredWorkMode?: 'ONSITE' | 'REMOTE' | 'HYBRID' | null
    currentProgram?: string | null
    organization?: string | null
    education?: ParsedEducation[]
    experiences?: ParsedExperience[]
    certificationDetails?: ParsedCertification[]
}

export type ImportedCvResult = {
    profile: {
        name: string | null
        lastname: string | null
        username: string | null
        phone: string | null
        email: string | null
        avatarUrl: string | null
        id: string
        userId: string
        bio: string | null
        birthDate: string | null
        gender: string | null
        address: string | null
        city: string | null
        domains: string[]
        schoolId: number | null
        currentYear: number | null
        currentProgram: string | null
        preferredCities: string[]
        preferredDomains: string[]
        preferredOfferTypes: string[]
        preferredWorkMode: string | null
        languages: string[]
        paidOnly: boolean
        availableFrom: string | null
        availableTo: string | null
        skills: Array<{ id: string; skillId: number; level: string }>
    }
    analysis: ImportedCvAnalysis
    cv: {
        id: string
        fileUrl: string
    }
}

@Injectable()
export class CvProfileImportService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly prisma: PrismaService,
        @Inject(IUserRepository) private readonly userRepo: IUserRepository,
        @Inject(IStudentProfileRepository) private readonly studentRepo: IStudentProfileRepository,
        @Inject(ICVRepository) private readonly cvRepo: ICVRepository,
        @Inject(ISkillRepository) private readonly skillRepo: ISkillRepository,
    ) {}

    async importCv(userId: string, file: Express.Multer.File): Promise<ImportedCvResult> {
        if (!file) {
            throw new BadRequestException('cv is required')
        }

        const user = await this.userRepo.findById(userId)
        const studentProfile = await this.studentRepo.findByUserId(userId)

        if (!user || !studentProfile) {
            throw new NotFoundException('Profile not found')
        }

        const cvText = await this.extractTextFromFile(file)
        const analysis = await this.analyseCv(cvText, file.originalname, file.mimetype)
        const splitName = this.splitName(analysis.fullName, analysis.firstName, analysis.lastName)
        const location = this.parseLocation(analysis.location)

        await this.commandBus.execute(
            new UpdateStudentProfileCommand(
                userId,
                splitName.firstName ?? undefined,
                splitName.lastName ?? undefined,
                analysis.email ?? undefined,
                undefined,
                analysis.phone ?? undefined,
                undefined,
                analysis.summary ?? undefined,
                undefined,
                undefined,
                location.address ?? undefined,
                location.city ?? undefined,
                analysis.mainDomain ? [analysis.mainDomain] : undefined,
                undefined,
                undefined,
                analysis.currentProgram ?? undefined,
                analysis.preferredCities?.length ? analysis.preferredCities : undefined,
                analysis.preferredDomains?.length ? analysis.preferredDomains : undefined,
                analysis.preferredOfferTypes?.length ? analysis.preferredOfferTypes : undefined,
                analysis.preferredWorkMode ?? undefined,
                analysis.languages?.length ? analysis.languages : undefined,
                undefined,
                undefined,
                undefined,
            ),
        )

        const skillNames = this.uniqueStrings([
            ...(analysis.skills ?? []),
            ...(analysis.dominantStack ?? []),
        ])
        if (skillNames.length > 0) {
            await this.replaceSkillAssignments(studentProfile.id, skillNames)
        }

        const educationRows = (analysis.education ?? []).map((item) => this.toEducationRow(studentProfile.id, item)).filter((item): item is NonNullable<typeof item> => Boolean(item))
        const experienceRows = (analysis.experiences ?? []).map((item) => this.toExperienceRow(studentProfile.id, item)).filter((item): item is NonNullable<typeof item> => Boolean(item))
        const certificationRows = (analysis.certificationDetails ?? this.mapCertificationsToRows(analysis.certifications ?? [])).map((item) => this.toCertificationRow(studentProfile.id, item)).filter((item): item is NonNullable<typeof item> => Boolean(item))

        if (educationRows.length > 0) {
            await this.prisma.education.deleteMany({ where: { studentProfileId: studentProfile.id } })
            await this.prisma.education.createMany({ data: educationRows })
        }

        if (experienceRows.length > 0) {
            await this.prisma.experience.deleteMany({ where: { studentProfileId: studentProfile.id } })
            await this.prisma.experience.createMany({ data: experienceRows })
        }

        if (certificationRows.length > 0) {
            await this.prisma.certification.deleteMany({ where: { studentProfileId: studentProfile.id } })
            await this.prisma.certification.createMany({ data: certificationRows })
        }

        if (analysis.summary) {
            studentProfile.bio = analysis.summary
        }
        if (location.city) {
            studentProfile.city = location.city
        }
        if (location.address) {
            studentProfile.address = location.address
        }
        if (analysis.mainDomain) {
            studentProfile.domains = this.uniqueStrings([analysis.mainDomain])
        }
        if (analysis.currentProgram) {
            studentProfile.currentProgram = analysis.currentProgram
        }
        if (analysis.preferredCities?.length) {
            studentProfile.preferredCities = this.uniqueStrings(analysis.preferredCities)
        }
        if (analysis.preferredDomains?.length) {
            studentProfile.preferredDomains = this.uniqueStrings(analysis.preferredDomains)
        }
        if (analysis.preferredOfferTypes?.length) {
            studentProfile.preferredOfferTypes = analysis.preferredOfferTypes
        }
        if (analysis.preferredWorkMode) {
            studentProfile.preferredWorkMode = analysis.preferredWorkMode as any
        }
        if (analysis.languages?.length) {
            studentProfile.languages = this.uniqueStrings(analysis.languages)
        }
        await this.studentRepo.update(studentProfile)

        if (analysis.firstName) {
            user.name = analysis.firstName
        }
        if (analysis.lastName) {
            user.lastname = analysis.lastName
        }
        if (analysis.email) {
            user.email = analysis.email
        }
        if (analysis.phone) {
            user.phone = analysis.phone
        }
        await this.userRepo.update(user)

        const publicProfileName = this.joinName(splitName.firstName, splitName.lastName)
        const publicEducation = educationRows.map((row) => [row.degree, row.field, row.school].filter(Boolean).join(' • ')).filter((item) => item.length > 0)
        const publicExperiences = experienceRows.map((row) => [row.role, row.company].filter(Boolean).join(' @ ')).filter((item) => item.length > 0)
        const publicAchievements = certificationRows.map((row) => [row.name, row.organization].filter(Boolean).join(' • ')).filter((item) => item.length > 0)

        await this.prisma.publicSessionProfile.upsert({
            where: { sessionKey: userId },
            create: {
                sessionKey: userId,
                name: publicProfileName ?? user.name,
                email: analysis.email ?? user.email,
                location: location.city ?? analysis.location ?? null,
                birthDate: null,
                targetedRole: analysis.targetRole ?? analysis.mainDomain ?? null,
                organization: analysis.organization ?? null,
                skills: skillNames,
                education: publicEducation,
                experiences: publicExperiences,
                achievements: publicAchievements,
                githubUrl: null,
                linkedinUrl: null,
                twitterUrl: null,
                avatarUrl: null,
                profileCompleted: true,
                isDeactivated: false,
                deactivatedAt: null,
                subscription: 'Starter',
                subscriptionEndDate: null,
            },
            update: {
                name: publicProfileName ?? undefined,
                email: analysis.email ?? undefined,
                location: location.city ?? analysis.location ?? undefined,
                targetedRole: analysis.targetRole ?? analysis.mainDomain ?? undefined,
                organization: analysis.organization ?? undefined,
                skills: skillNames.length ? skillNames : undefined,
                education: publicEducation.length ? publicEducation : undefined,
                experiences: publicExperiences.length ? publicExperiences : undefined,
                achievements: publicAchievements.length ? publicAchievements : undefined,
                profileCompleted: true,
            },
        })

        const cv = await this.cvRepo.save(new CV(randomUUID(), studentProfile.id, this.toDataUri(file)))

        return {
            profile: await this.buildProfileResponse(userId),
            analysis,
            cv: {
                id: cv.id,
                fileUrl: cv.fileUrl,
            },
        }
    }

    private async buildProfileResponse(userId: string) {
        const [profile, user] = await Promise.all([
            this.studentRepo.findByUserId(userId),
            this.userRepo.findById(userId),
        ])

        if (!profile || !user) {
            throw new NotFoundException('Profile not found')
        }

        return {
            name: user.name ?? null,
            lastname: user.lastname ?? null,
            username: user.username ?? null,
            phone: user.phone ?? null,
            email: user.email ?? null,
            avatarUrl: user.avatarUrl ?? null,
            id: profile.id,
            userId: profile.userId,
            bio: profile.bio ?? null,
            birthDate: profile.birthDate?.toISOString() ?? null,
            gender: profile.gender ?? null,
            address: profile.address ?? null,
            city: profile.city ?? null,
            domains: profile.domains ?? [],
            schoolId: profile.schoolId ?? null,
            currentYear: profile.currentYear ?? null,
            currentProgram: profile.currentProgram ?? null,
            preferredCities: profile.preferredCities ?? [],
            preferredDomains: profile.preferredDomains ?? [],
            preferredOfferTypes: profile.preferredOfferTypes ?? [],
            preferredWorkMode: profile.preferredWorkMode ?? null,
            languages: profile.languages ?? [],
            paidOnly: profile.paidOnly ?? false,
            availableFrom: profile.availableFrom?.toISOString() ?? null,
            availableTo: profile.availableTo?.toISOString() ?? null,
            skills: (profile.skills ?? []).map((assignment) => ({
                id: assignment.id,
                skillId: assignment.skillId,
                level: assignment.level,
            })),
        }
    }

    private async analyseCv(text: string, fileName: string, mimeType: string): Promise<ImportedCvAnalysis> {
        const cleaned = text.replace(/\s+/g, ' ').trim()
        const fallback = this.buildFallbackAnalysis(cleaned, fileName)
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey || !cleaned) {
            return fallback
        }

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: process.env.GROQ_LLM_MODEL || 'llama-3.3-70b-versatile',
                    temperature: 0.2,
                    max_tokens: 2400,
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'system',
                            content: [
                                'You are an expert CV parser.',
                                'Return only valid JSON.',
                                'Use only information explicitly present in the CV text.',
                                'Do not guess missing values.',
                                'If a value is not present, use null for scalars and [] for arrays.',
                                'The output keys must be: full_name, first_name, last_name, email, phone, location, summary, target_role, main_domain, experience_level, dominant_stack, skills, languages, certifications, preferred_domains, preferred_offer_types, preferred_cities, preferred_work_mode, current_program, organization, education, experiences, certification_details.',
                                'For education items, include school, degree, field, startDate, endDate, description.',
                                'For experience items, include company, role, startDate, endDate, description.',
                                'For certification_details items, include name, organization, issueDate, expirationDate, credentialId, credentialUrl.',
                                'Use ISO dates when available, otherwise null.',
                            ].join(' '),
                        },
                        {
                            role: 'user',
                            content: `CV text:\n${cleaned.slice(0, 12000)}\n\nFilename: ${fileName}\nMIME type: ${mimeType}`,
                        },
                    ],
                }),
            })

            if (!response.ok) {
                return fallback
            }

            const payload = await response.json().catch(() => null) as { choices?: Array<{ message?: { content?: string } }> } | null
            const parsed = this.safeJsonParse(payload?.choices?.[0]?.message?.content ?? '')
            if (!parsed || typeof parsed !== 'object') {
                return fallback
            }

            return this.normalizeAnalysis(parsed as Record<string, unknown>, fallback)
        } catch {
            return fallback
        }
    }

    private buildFallbackAnalysis(text: string, fileName: string): ImportedCvAnalysis {
        const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null
        const phone = text.match(/(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}/)?.[0] ?? null
        const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean)
        const firstLine = lines[0] ?? fileName.replace(/\.[^.]+$/, '')
        const mainDomain = this.detectDomain(text)
        const skills = this.extractSkillHints(text)
        const languages = this.extractLanguageHints(text)

        return {
            fullName: firstLine || null,
            firstName: firstLine.split(/\s+/)[0] ?? null,
            lastName: firstLine.split(/\s+/).slice(1).join(' ') || null,
            email,
            phone,
            location: this.extractLocation(lines),
            summary: null,
            targetRole: mainDomain ? this.domainToRole(mainDomain) : null,
            mainDomain,
            experienceLevel: this.detectExperienceLevel(text),
            dominantStack: skills.slice(0, 8),
            skills,
            languages,
            certifications: this.extractCertificationHints(text),
            preferredDomains: mainDomain ? [mainDomain] : [],
            preferredOfferTypes: this.detectPreferredOfferTypes(text),
            preferredCities: this.extractPreferredCities(lines),
            preferredWorkMode: this.detectPreferredWorkMode(text),
            currentProgram: this.extractCurrentProgram(text),
            organization: null,
            education: [],
            experiences: [],
            certificationDetails: [],
        }
    }

    private normalizeAnalysis(parsed: Record<string, unknown>, fallback: ImportedCvAnalysis): ImportedCvAnalysis {
        const education = this.toParsedEducationArray(parsed.education)
        const experiences = this.toParsedExperienceArray(parsed.experiences)
        const certificationDetails = this.toParsedCertificationArray(parsed.certification_details)

        return {
            fullName: this.toNullableString(parsed.full_name) ?? fallback.fullName,
            firstName: this.toNullableString(parsed.first_name) ?? fallback.firstName,
            lastName: this.toNullableString(parsed.last_name) ?? fallback.lastName,
            email: this.toNullableString(parsed.email) ?? fallback.email,
            phone: this.toNullableString(parsed.phone) ?? fallback.phone,
            location: this.toNullableString(parsed.location) ?? fallback.location,
            summary: this.toNullableString(parsed.summary) ?? fallback.summary,
            targetRole: this.toNullableString(parsed.target_role) ?? fallback.targetRole,
            mainDomain: this.normalizeDomain(this.toNullableString(parsed.main_domain)) ?? fallback.mainDomain,
            experienceLevel: this.toExperienceLevel(parsed.experience_level) ?? fallback.experienceLevel ?? null,
            dominantStack: this.toStringArray(parsed.dominant_stack, fallback.dominantStack),
            skills: this.toStringArray(parsed.skills, fallback.skills),
            languages: this.toStringArray(parsed.languages, fallback.languages),
            certifications: this.toStringArray(parsed.certifications, fallback.certifications),
            preferredDomains: this.normalizeDomains(this.toStringArray(parsed.preferred_domains, fallback.preferredDomains)),
            preferredOfferTypes: this.normalizeOfferTypes(this.toStringArray(parsed.preferred_offer_types, fallback.preferredOfferTypes as unknown as string[])),
            preferredCities: this.toStringArray(parsed.preferred_cities, fallback.preferredCities),
            preferredWorkMode: this.toWorkMode(parsed.preferred_work_mode) ?? fallback.preferredWorkMode ?? null,
            currentProgram: this.toNullableString(parsed.current_program) ?? fallback.currentProgram,
            organization: this.toNullableString(parsed.organization) ?? fallback.organization,
            education: education.length ? education : fallback.education ?? [],
            experiences: experiences.length ? experiences : fallback.experiences ?? [],
            certificationDetails: certificationDetails.length ? certificationDetails : fallback.certificationDetails ?? [],
        }
    }

    private async extractTextFromFile(file: Express.Multer.File) {
        const mime = file.mimetype || ''
        if (mime.startsWith('text/')) {
            return file.buffer.toString('utf8').trim()
        }

        if (mime === 'application/pdf') {
            const parsed = await pdfParse(file.buffer)
            return parsed.text.replace(/\s+/g, ' ').trim()
        }

        if (mime.startsWith('image/')) {
            try {
                const { createWorker } = await import('tesseract.js')
                const worker = await createWorker('eng')
                const { data } = await worker.recognize(file.buffer)
                await worker.terminate()
                return String(data.text ?? '').replace(/\s+/g, ' ').trim()
            } catch {
                return ''
            }
        }

        throw new BadRequestException('Only PDF or image files are allowed')
    }

    private async replaceSkillAssignments(studentProfileId: string, skillNames: string[]) {
        await this.prisma.skillAssignment.deleteMany({ where: { studentProfileId } })

        const data: Array<{ id: string; skillId: number; studentProfileId: string; level: SkillLevel }> = []
        for (const [index, name] of skillNames.entries()) {
            const existingSkill = await this.skillRepo.findByName(name)
            const skill = existingSkill ?? await this.prisma.skill.create({ data: { name } })
            data.push({
                id: randomUUID(),
                skillId: skill.id,
                studentProfileId,
                level: index < 3 ? SkillLevel.ADVANCED : SkillLevel.INTERMEDIATE,
            })
        }

        if (data.length) {
            await this.prisma.skillAssignment.createMany({ data })
        }
    }

    private toEducationRow(studentProfileId: string, item: ParsedEducation) {
        if (!item.school || !item.degree || !item.field || !item.startDate) {
            return null
        }

        const startDate = new Date(item.startDate)
        if (Number.isNaN(startDate.getTime())) {
            return null
        }

        const endDate = item.endDate ? new Date(item.endDate) : null

        return {
            id: randomUUID(),
            studentProfileId,
            school: item.school,
            degree: item.degree,
            field: item.field,
            startDate,
            endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
            description: item.description ?? null,
        }
    }

    private toExperienceRow(studentProfileId: string, item: ParsedExperience) {
        if (!item.company || !item.role || !item.startDate) {
            return null
        }

        const startDate = new Date(item.startDate)
        if (Number.isNaN(startDate.getTime())) {
            return null
        }

        const endDate = item.endDate ? new Date(item.endDate) : null

        return {
            id: randomUUID(),
            studentProfileId,
            company: item.company,
            role: item.role,
            startDate,
            endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
            description: item.description ?? null,
        }
    }

    private toCertificationRow(studentProfileId: string, item: ParsedCertification) {
        if (!item.name || !item.organization || !item.issueDate) {
            return null
        }

        const issueDate = new Date(item.issueDate)
        if (Number.isNaN(issueDate.getTime())) {
            return null
        }

        const expirationDate = item.expirationDate ? new Date(item.expirationDate) : null

        return {
            id: randomUUID(),
            studentProfileId,
            name: item.name,
            organization: item.organization,
            issueDate,
            expirationDate: expirationDate && !Number.isNaN(expirationDate.getTime()) ? expirationDate : null,
            credentialId: item.credentialId ?? null,
            credentialUrl: item.credentialUrl ?? null,
        }
    }

    private buildFallbackAnalysis(text: string, fileName: string): ImportedCvAnalysis {
        const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null
        const phone = text.match(/(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}/)?.[0] ?? null
        const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean)
        const firstLine = lines[0] ?? fileName.replace(/\.[^.]+$/, '')
        const mainDomain = this.detectDomain(text)
        const skills = this.extractSkillHints(text)
        const languages = this.extractLanguageHints(text)

        return {
            fullName: firstLine || null,
            firstName: firstLine.split(/\s+/)[0] ?? null,
            lastName: firstLine.split(/\s+/).slice(1).join(' ') || null,
            email,
            phone,
            location: this.extractLocation(lines),
            summary: null,
            targetRole: mainDomain ? this.domainToRole(mainDomain) : null,
            mainDomain,
            experienceLevel: this.detectExperienceLevel(text),
            dominantStack: skills.slice(0, 8),
            skills,
            languages,
            certifications: this.extractCertificationHints(text),
            preferredDomains: mainDomain ? [mainDomain] : [],
            preferredOfferTypes: this.detectPreferredOfferTypes(text),
            preferredCities: this.extractPreferredCities(lines),
            preferredWorkMode: this.detectPreferredWorkMode(text),
            currentProgram: this.extractCurrentProgram(text),
            organization: null,
            education: [],
            experiences: [],
            certificationDetails: [],
        }
    }

    private extractLocation(lines: string[]) {
        for (const line of lines.slice(0, 8)) {
            if (line.includes(',') && line.length <= 80) {
                return line
            }
        }
        return null
    }

    private extractPreferredCities(lines: string[]) {
        const location = this.extractLocation(lines)
        if (!location) {
            return []
        }

        const city = this.parseLocation(location).city
        return city ? [city] : []
    }

    private extractCurrentProgram(text: string) {
        const match = text.match(/(?:student|studying|currently pursuing|current program|major|bachelor|master|engineering)[^\n]{0,120}/i)
        return match?.[0]?.trim() ?? null
    }

    private extractSkillHints(text: string) {
        const pool = [
            'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'NestJS', 'Nest.js', 'Python', 'Java', 'C#', 'Go',
            'PHP', 'Laravel', 'Django', 'FastAPI', 'Express', 'REST', 'GraphQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'CI/CD', 'Git', 'Linux', 'Tailwind', 'Figma',
            'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science', 'DevOps', 'Flutter', 'React Native', 'Swift', 'Kotlin',
        ]

        const matches = pool.filter((skill) => new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text))
        return this.uniqueStrings(matches)
    }

    private extractLanguageHints(text: string) {
        const languages = ['Arabic', 'English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese']
        return this.uniqueStrings(languages.filter((language) => new RegExp(`\\b${language}\\b`, 'i').test(text)))
    }

    private extractCertificationHints(text: string) {
        const hints = [
            'AWS Certified', 'Azure Certified', 'Google Cloud Certified', 'PMP', 'Scrum', 'Cisco', 'Oracle', 'Oracle Certified',
            'Microsoft Certified', 'CompTIA', 'IELTS', 'TOEFL', 'DELF', 'DALF', 'Cambridge',
        ]
        return this.uniqueStrings(hints.filter((cert) => new RegExp(cert.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)))
    }

    private detectDomain(text: string) {
        const lower = text.toLowerCase()
        const domainMatchers: Array<[string, RegExp]> = [
            ['Machine Learning & AI', /machine learning|deep learning|artificial intelligence|ai engineer|ml engineer/i],
            ['Data Engineering', /data engineering|etl|airflow|dbt|spark|pandas|data pipeline/i],
            ['Data Science', /data science|data scientist|statistics|visualization|analytics/i],
            ['DevOps & SRE', /devops|site reliability|sre|monitoring|observability|ci\/cd/i],
            ['Cloud Engineering', /cloud|aws|azure|gcp|serverless|terraform/i],
            ['Cybersecurity', /security|cybersecurity|pentest|soc|siem/i],
            ['Mobile Development', /flutter|react native|mobile|android|ios|swift|kotlin/i],
            ['Frontend Development', /frontend|react|next\.js|ui\/ux|tailwind|frontend engineer/i],
            ['Backend Development', /backend|api|nestjs|node\.js|express|microservices|backend engineer/i],
            ['Full-Stack Development', /full[- ]stack|fullstack|react.*node|node.*react/i],
            ['UI/UX Design', /ui\/ux|figma|product design|interaction design/i],
            ['Web Development', /web development|javascript|typescript|html|css/i],
        ]

        for (const [domain, pattern] of domainMatchers) {
            if (pattern.test(lower)) {
                return domain
            }
        }

        return null
    }

    private domainToRole(domain: string) {
        const mapping: Record<string, string> = {
            'Machine Learning & AI': 'AI Engineer',
            'Data Engineering': 'Data Engineer',
            'Data Science': 'Data Scientist',
            'DevOps & SRE': 'DevOps Engineer',
            'Cloud Engineering': 'Cloud Engineer',
            'Cybersecurity': 'Security Engineer',
            'Mobile Development': 'Mobile Developer',
            'Frontend Development': 'Frontend Engineer',
            'Backend Development': 'Backend Engineer',
            'Full-Stack Development': 'Full Stack Engineer',
            'UI/UX Design': 'UI/UX Designer',
            'Web Development': 'Web Developer',
        }

        return mapping[domain] ?? domain
    }

    private detectExperienceLevel(text: string) {
        const lower = text.toLowerCase()
        if (/(senior|lead|principal|staff|architect)/i.test(lower)) return 'senior'
        if (/(mid|intermediate|3\+ years|4\+ years|5\+ years)/i.test(lower)) return 'mid'
        if (/(junior|entry|intern|stage|student|graduate|fresh graduate|0\+ years|1 year|2 years)/i.test(lower)) return 'junior'
        return null
    }

    private detectPreferredOfferTypes(text: string) {
        const lower = text.toLowerCase()
        const results: Array<'INTERNSHIP' | 'PFE' | 'RESEARCH' | 'PHD' | 'ALTERNANCE'> = []
        if (/intern|stage|internship/.test(lower)) results.push('INTERNSHIP')
        if (/pfe|final year project/.test(lower)) results.push('PFE')
        if (/research|research assistant|r&d/.test(lower)) results.push('RESEARCH')
        if (/phd|doctorate|doctoral/.test(lower)) results.push('PHD')
        if (/alternance|apprenticeship|work-study/.test(lower)) results.push('ALTERNANCE')
        return this.uniqueStrings(results)
    }

    private detectPreferredWorkMode(text: string) {
        const lower = text.toLowerCase()
        if (/remote|telework|work from home/.test(lower)) return 'REMOTE'
        if (/hybrid/.test(lower)) return 'HYBRID'
        if (/onsite|on-site|office/.test(lower)) return 'ONSITE'
        return null
    }

    private normalizeDomain(value?: string | null) {
        const domain = this.toNullableString(value)
        if (!domain) return null

        const lower = domain.toLowerCase()
        const mapping: Array<[string, string[]]> = [
            ['Machine Learning & AI', ['ai', 'machine learning', 'ml', 'artificial intelligence']],
            ['Data Engineering', ['data engineering', 'etl', 'spark', 'airflow']],
            ['Data Science', ['data science', 'data scientist', 'analytics']],
            ['DevOps & SRE', ['devops', 'sre', 'site reliability']],
            ['Cloud Engineering', ['cloud', 'aws', 'azure', 'gcp']],
            ['Cybersecurity', ['security', 'cyber']],
            ['Mobile Development', ['mobile', 'flutter', 'react native', 'android', 'ios']],
            ['Frontend Development', ['frontend', 'ui', 'react', 'next.js']],
            ['Backend Development', ['backend', 'api', 'nest', 'node', 'express']],
            ['Full-Stack Development', ['full stack', 'fullstack']],
            ['UI/UX Design', ['ui/ux', 'design', 'figma']],
            ['Web Development', ['web development', 'web', 'javascript', 'typescript']],
        ]

        for (const [canonical, keywords] of mapping) {
            if (keywords.some((keyword) => lower.includes(keyword))) {
                return canonical
            }
        }

        return domain
    }

    private normalizeDomains(values: string[]) {
        return this.uniqueStrings(values.map((value) => this.normalizeDomain(value) ?? value))
    }

    private normalizeOfferTypes(values: string[]) {
        const allowed = new Set(['INTERNSHIP', 'PFE', 'RESEARCH', 'PHD', 'ALTERNANCE'])
        return this.uniqueStrings(values.map((value) => value.toUpperCase().trim()).filter((value) => allowed.has(value)))
    }

    private toExperienceLevel(value: unknown) {
        const normalized = this.toNullableString(value)
        if (!normalized) return null
        const lower = normalized.toLowerCase()
        if (lower === 'junior' || lower === 'mid' || lower === 'senior') return lower as 'junior' | 'mid' | 'senior'
        return null
    }

    private toWorkMode(value: unknown) {
        const normalized = this.toNullableString(value)
        if (!normalized) return null
        const upper = normalized.toUpperCase()
        if (upper === 'ONSITE' || upper === 'REMOTE' || upper === 'HYBRID') return upper as 'ONSITE' | 'REMOTE' | 'HYBRID'
        return null
    }

    private toStringArray(value: unknown, fallback: string[] = []) {
        const array = Array.isArray(value) ? value : []
        const cleaned = array.map((item) => this.toNullableString(item)).filter((item): item is string => Boolean(item))
        return cleaned.length ? this.uniqueStrings(cleaned) : fallback
    }

    private toParsedEducationArray(value: unknown): ParsedEducation[] {
        if (!Array.isArray(value)) return []
        return value
            .map((item) => {
                if (!item || typeof item !== 'object') return null
                const record = item as Record<string, unknown>
                return {
                    school: this.toNullableString(record.school),
                    degree: this.toNullableString(record.degree),
                    field: this.toNullableString(record.field),
                    startDate: this.toNullableString(record.startDate),
                    endDate: this.toNullableString(record.endDate),
                    description: this.toNullableString(record.description),
                }
            })
            .filter((item): item is ParsedEducation => Boolean(item))
    }

    private toParsedExperienceArray(value: unknown): ParsedExperience[] {
        if (!Array.isArray(value)) return []
        return value
            .map((item) => {
                if (!item || typeof item !== 'object') return null
                const record = item as Record<string, unknown>
                return {
                    company: this.toNullableString(record.company),
                    role: this.toNullableString(record.role),
                    startDate: this.toNullableString(record.startDate),
                    endDate: this.toNullableString(record.endDate),
                    description: this.toNullableString(record.description),
                }
            })
            .filter((item): item is ParsedExperience => Boolean(item))
    }

    private toParsedCertificationArray(value: unknown): ParsedCertification[] {
        if (!Array.isArray(value)) return []
        return value
            .map((item) => {
                if (!item || typeof item !== 'object') return null
                const record = item as Record<string, unknown>
                return {
                    name: this.toNullableString(record.name),
                    organization: this.toNullableString(record.organization),
                    issueDate: this.toNullableString(record.issueDate),
                    expirationDate: this.toNullableString(record.expirationDate),
                    credentialId: this.toNullableString(record.credentialId),
                    credentialUrl: this.toNullableString(record.credentialUrl),
                }
            })
            .filter((item): item is ParsedCertification => Boolean(item))
    }

    private mapCertificationsToRows(values: string[]) {
        return values.map((value) => ({
            name: value,
            organization: '',
            issueDate: null,
            expirationDate: null,
            credentialId: null,
            credentialUrl: null,
        }))
    }

    private safeJsonParse(content: string) {
        const cleaned = content.replace(/```json|```/g, '').trim()
        try {
            return JSON.parse(cleaned)
        } catch {
            return null
        }
    }

    private splitName(fullName?: string | null, firstName?: string | null, lastName?: string | null) {
        const cleanFirst = this.toNullableString(firstName)
        const cleanLast = this.toNullableString(lastName)
        if (cleanFirst || cleanLast) {
            return { firstName: cleanFirst ?? null, lastName: cleanLast ?? null }
        }

        const source = this.toNullableString(fullName)
        if (!source) {
            return { firstName: null, lastName: null }
        }

        const parts = source.split(/\s+/).filter(Boolean)
        if (parts.length === 1) {
            return { firstName: parts[0], lastName: null }
        }

        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
        }
    }

    private joinName(firstName?: string | null, lastName?: string | null) {
        return [firstName, lastName].filter(Boolean).join(' ').trim() || null
    }

    private parseLocation(location?: string | null) {
        const value = this.toNullableString(location)
        if (!value) {
            return { city: null as string | null, address: null as string | null }
        }

        const parts = value.split(',').map((part) => part.trim()).filter(Boolean)
        if (parts.length === 0) {
            return { city: null, address: null }
        }

        if (parts.length === 1) {
            return { city: parts[0], address: null }
        }

        return {
            city: parts[0],
            address: parts.slice(1).join(', '),
        }
    }

    private toDataUri(file: Express.Multer.File) {
        const mime = file.mimetype || 'application/octet-stream'
        return `data:${mime};base64,${file.buffer.toString('base64')}`
    }

    private toNullableString(value: unknown) {
        if (typeof value !== 'string') return null
        const trimmed = value.trim()
        return trimmed.length ? trimmed : null
    }

    private uniqueStrings(values: string[]) {
        return Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)))
    }
}