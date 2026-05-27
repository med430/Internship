import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    NotFoundException,
    Patch,
    Param,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UploadedFiles,
    UnauthorizedException,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { OnboardService } from './onboard.service'
import { UpdatePublicProfileDto } from './dto/update-public-profile.dto'
import { AnyFilesInterceptor } from '@nestjs/platform-express'
import { OfferFeedService } from '../../../Application/Features/OfferRecommendationFeature/offer-feed.service'
import { SubscriptionGuard } from '../guards/subscription.guard'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { SupabaseUser } from '../decorators/supabase-user.decorator'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'
import { IOfferRepository } from '../../../Application/repositories/offer.repository'
import { IOfferBookmarkRepository } from '../../../Application/repositories/offer-bookmark.repository'
import { IRecommendationScoreRepository } from '../../../Application/repositories/recommendation-score.repository'
import { Offer } from '../../../Domain/entities/offer.entity'
import type { ScoreBreakdown } from '../../../Domain/entities/recommendation-score.entity'

@Controller()
export class OnboardController {
    constructor(
        private readonly onboardService: OnboardService,
        private readonly offerFeed: OfferFeedService,
        @Inject(IOfferRepository)               private readonly offerRepo: IOfferRepository,
        @Inject(IOfferBookmarkRepository)       private readonly bookmarkRepo: IOfferBookmarkRepository,
        @Inject(IRecommendationScoreRepository) private readonly scoreRepo: IRecommendationScoreRepository,
    ) {}

    @Get('health')
    health() {
        return this.onboardService.health()
    }

    @Post('api/extract-text')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async extractText(@UploadedFile() file: Express.Multer.File) {
        return this.onboardService.extractText(file)
    }

    @Get('onboard/dashboard')
    async dashboard(@Req() req: Request) {
        return this.onboardService.getDashboard(this.getSessionKey(req))
    }

    @Get('onboard/profile')
    async profile(@Req() req: Request) {
        return this.onboardService.getProfile(this.getSessionKey(req))
    }

    @Patch('onboard/profile')
    async updateProfile(@Req() req: Request, @Body() dto: UpdatePublicProfileDto) {
        return this.onboardService.updateProfile(this.getSessionKey(req), dto)
    }

    // Authenticated student → personalised feed (jobs key preserved). Anonymous → existing demo filter flow.
    @Post('jobs/filter')
    async filterJobs(@Req() req: Request, @Body() body: Record<string, any>) {
        const outcome = await this.offerFeed.dispatch({
            bearerToken: this.extractBearerToken(req.header('authorization')),
            limit: typeof body.limit === 'number' ? body.limit : 20,
            cursor: typeof body.cursor === 'string' ? body.cursor : undefined,
            savedOnly: body.savedOnly === true,
            explore: body.explore === true,
            exploreSeed: typeof body.exploreSeed === 'number' ? body.exploreSeed : undefined,
        })

        if (outcome.kind === 'authenticated') {
            return {
                success: true,
                jobs: outcome.page.items.map((item) => this.mapItemToJobDocument(item)),
                total_found: outcome.page.items.length,
                next_cursor: outcome.page.nextCursor,
                source: outcome.page.source,
                message: `Found ${outcome.page.items.length} matches for you.`,
            }
        }

        return this.onboardService.filterJobs(body, body.resume_content, body.limit)
    }

    // Authenticated student → personalised feed. Anonymous (or unknown JWT) → existing demo flow.
    @Post('jobs/match')
    async matchJobs(@Req() req: Request, @Body() body: Record<string, any>) {
        const outcome = await this.offerFeed.dispatch({
            bearerToken: this.extractBearerToken(req.header('authorization')),
            limit: typeof body.limit === 'number' ? body.limit : 20,
            cursor: typeof body.cursor === 'string' ? body.cursor : undefined,
            savedOnly: body.savedOnly === true,
            explore: false,
        })

        if (outcome.kind === 'authenticated') {
            return {
                success: true,
                matches: outcome.page.items.map((item) => this.mapItemToJobDocument(item)),
                total_found: outcome.page.items.length,
                next_cursor: outcome.page.nextCursor,
                source: outcome.page.source,
                message: `Found ${outcome.page.items.length} matches for you.`,
            }
        }

        if (!body.resume_content) {
            throw new BadRequestException('resume_content is required')
        }
        return this.onboardService.matchJobs(body.resume_content, body.limit)
    }

    // Shapes a ranked offer into the JobDocument format the frontend expects.
    private mapItemToJobDocument(item: { offer: Offer; score: number; breakdown?: ScoreBreakdown; bookmarked: boolean }) {
        const offer = item.offer
        const salary = offer.stipendMin && offer.stipendMax
            ? `${offer.stipendMin}-${offer.stipendMax} TND`
            : offer.isPaid ? 'paid' : 'unpaid'
        return {
            job_id: offer.id,
            title: offer.title,
            company: offer.company,
            location: offer.location,
            description: offer.description,
            work_model: offer.workMode,
            employment_type: offer.type,
            job_function: offer.domain,
            salary,
            source: 'stagio',
            source_url: `/services/offers/${offer.id}`,
            posted_date: (offer.createdAt ?? new Date()).toISOString(),
            match_score: Math.round(item.score * 100),
            score_breakdown: this.sanitizeBreakdown(item.breakdown, offer),
            bookmarked: item.bookmarked,
            is_paid: !!offer.isPaid,
            application_deadline: offer.applicationDeadline?.toISOString() ?? null,
            positions_count: offer.positionsCount ?? 1,
        }
    }

    // Full offer detail for the dedicated detail page. Requires Supabase auth.
    @Get('offers/:id')
    @UseGuards(SupabaseAuthGuard)
    async offerDetail(@Param('id') id: string, @SupabaseUser() user: ResolvedUser) {
        const offer = await this.offerRepo.findById(id)
        if (!offer || offer.deletedAt) throw new NotFoundException('offer not found')

        const [bookmarks, scoreRows] = await Promise.all([
            this.bookmarkRepo.findActiveByStudent(user.id),
            this.scoreRepo.findTopForStudent(user.id, 200),
        ])
        const scoreRow = scoreRows.find(s => s.offerId === id)
        const bookmarked = bookmarks.some(b => b.offerId === id)

        return {
            id: offer.id,
            title: offer.title,
            company: offer.company,
            location: offer.location,
            description: offer.description,
            domain: offer.domain,
            work_model: offer.workMode,
            employment_type: offer.type,
            is_paid: !!offer.isPaid,
            stipend_min: offer.stipendMin ?? null,
            stipend_max: offer.stipendMax ?? null,
            salary: this.formatSalary(offer),
            languages_required: offer.languagesRequired ?? [],
            positions_count: offer.positionsCount ?? 1,
            start_date: offer.startDate?.toISOString() ?? null,
            end_date: offer.endDate?.toISOString() ?? null,
            application_deadline: offer.applicationDeadline?.toISOString() ?? null,
            posted_date: (offer.createdAt ?? new Date()).toISOString(),
            skills: (offer.skillRequirements ?? []).map((sr) => ({
                id: sr.skill.id,
                name: sr.skill.name,
                level: sr.level,
                mandatory: sr.mandatory,
            })),
            bookmarked,
            match_score: scoreRow ? Math.round(scoreRow.finalScore * 100) : null,
            score_breakdown: scoreRow ? this.sanitizeBreakdown(scoreRow.breakdown, offer) ?? null : null,
        }
    }

    // Renders the stipend range or the binary paid/unpaid label as a single human-readable string.
    private formatSalary(offer: Offer): string {
        if (offer.stipendMin && offer.stipendMax) return `${offer.stipendMin}-${offer.stipendMax} TND`
        return offer.isPaid ? 'Paid' : 'Unpaid'
    }

    private sanitizeBreakdown(
        breakdown: unknown,
        offer: Pick<Offer, 'skillRequirements'>,
    ): Record<string, number> | undefined {
        if (!breakdown || typeof breakdown !== 'object' || Array.isArray(breakdown)) {
            return undefined
        }

        const sanitized: Record<string, number> = {}
        for (const [key, value] of Object.entries(breakdown as Record<string, unknown>)) {
            if (typeof value === 'number' && Number.isFinite(value)) {
                sanitized[key] = value
            }
        }

        if ((offer.skillRequirements ?? []).length === 0) {
            delete sanitized.skillMatch
        }

        return Object.keys(sanitized).length > 0 ? sanitized : undefined
    }

    @Get('virtual-interviewer/personas')
    async personas() {
        return this.onboardService.listPersonas()
    }

    @Post('generate_queries')
    @UseGuards(SubscriptionGuard)
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'cv', maxCount: 1 },
                { name: 'job_descriptions', maxCount: 10 },
            ],
            { storage: memoryStorage() },
        ),
    )
    async generateQueries(
        @Req() req: Request,
        @UploadedFiles()
        files: {
            cv?: Express.Multer.File[]
            job_descriptions?: Express.Multer.File[]
        },
    ) {
        const cv = files?.cv?.[0]
        const jobDescriptions = files?.job_descriptions ?? []
        if (!cv) {
            throw new BadRequestException('cv is required')
        }

        return this.onboardService.generateQuestions(this.getSessionKey(req), cv, jobDescriptions)
    }

    @Get('cv-rewriter/questions')
    async listOpenQuestionSessions(
        @Req() req: Request,
        @Query('limit') limit?: string,
    ) {
        return this.onboardService.listOpenCvQuestionSessions(
            this.getSessionKey(req),
            Number(limit || 50),
        )
    }

    @Get('cv-rewriter/questions/:id')
    async getQuestionSession(@Req() req: Request, @Param('id') id: string) {
        return this.onboardService.getCvQuestionSession(this.getSessionKey(req), id)
    }

    @Post('rewrite_cv')
    @UseGuards(SubscriptionGuard)
    @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
    async rewriteCv(@Req() req: Request, @Body() body: Record<string, any> = {}) {
        const questionSessionId = String(body.question_session_id || '').trim()
        if (!questionSessionId) {
            throw new BadRequestException('question_session_id is required')
        }

        let answers: Array<{ question: string; answer: string }> = []
        try {
            answers = JSON.parse(String(body.answers || '[]'))
        } catch {
            throw new BadRequestException('answers must be valid JSON')
        }

        return this.onboardService.rewriteCv(
            this.getSessionKey(req),
            questionSessionId,
            answers,
            this.getBaseUrl(req),
        )
    }

    @Get('onboard/cvs')
    async listCvs(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        return this.onboardService.listCvs(
            this.getSessionKey(req),
            Number(page || 1),
            Number(pageSize || 10),
            this.getBaseUrl(req),
        )
    }

    @Get('onboard/cvs/:id')
    async getCv(@Req() req: Request, @Param('id') id: string) {
        return this.onboardService.getCv(this.getSessionKey(req), id, this.getBaseUrl(req))
    }

    @Delete('onboard/cvs/:id')
    async deleteCv(@Req() req: Request, @Param('id') id: string) {
        return this.onboardService.deleteCv(this.getSessionKey(req), id)
    }

    @Get('download_cv/:id')
    async downloadCv(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') id: string,
    ) {
        const file = await this.onboardService.downloadCv(this.getSessionKey(req), id)
        res.redirect(file.url)
    }

    @Get('onboard/user-name')
    async userName(@Req() req: Request) {
        return this.onboardService.getUserName(this.getSessionKey(req))
    }

    @Post('career-guide/generate')
    @UseGuards(SubscriptionGuard)
    @UseInterceptors(FileInterceptor('cv', { storage: memoryStorage() }))
    async generateCareerGuide(
        @Req() req: Request,
        @UploadedFile() cv: Express.Multer.File | undefined,
        @Body() body: Record<string, any>,
    ) {
        const currentJob = String(body.current_job || '').trim()
        const domain = String(body.domain || '').trim()
        if (!currentJob || !domain) {
            throw new BadRequestException('current_job and domain are required')
        }

        return this.onboardService.generateCareerGuide(
            this.getSessionKey(req),
            cv,
            body.cv_text,
            currentJob,
            domain,
            body.target_job,
        )
    }

    @Get('onboard/career-guides')
    async listCareerGuides(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        return this.onboardService.listCareerGuides(
            this.getSessionKey(req),
            Number(page || 1),
            Number(pageSize || 10),
        )
    }

    @Get('onboard/career-guides/:id')
    async getCareerGuide(@Req() req: Request, @Param('id') id: string) {
        return this.onboardService.getCareerGuide(this.getSessionKey(req), id)
    }

    @Get('portfolio/options')
    async portfolioOptions() {
        return this.onboardService.getPortfolioOptions()
    }

    @Post('portfolio/build')
    @UseGuards(SubscriptionGuard)
    @UseInterceptors(FileInterceptor('cv', { storage: memoryStorage() }))
    async buildPortfolio(
        @Req() req: Request,
        @UploadedFile() cv: Express.Multer.File | undefined,
        @Body() body: Record<string, any>,
    ) {
        if (!body.wireframe || !body.theme) {
            throw new BadRequestException('wireframe and theme are required')
        }

        let personalInfo: Record<string, unknown> | undefined
        if (body.personal_info) {
            try {
                personalInfo = JSON.parse(String(body.personal_info))
            } catch {
                throw new BadRequestException('personal_info must be valid JSON')
            }
        }

        return this.onboardService.generatePortfolio(this.getSessionKey(req), {
            wireframe: String(body.wireframe),
            theme: String(body.theme),
            cv,
            cvText: body.cv_text,
            personalInfo,
            photoUrl: body.photo_url,
        })
    }

    @Get('onboard/portfolio-generations')
    async listPortfolioGenerations(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        return this.onboardService.listPortfolioGenerations(
            this.getSessionKey(req),
            Number(page || 1),
            Number(pageSize || 10),
        )
    }

    @Get('onboard/portfolio-generations/:id')
    async getPortfolioGeneration(@Req() req: Request, @Param('id') id: string) {
        return this.onboardService.getPortfolioGeneration(this.getSessionKey(req), id)
    }

    @Post('onboard/interviews/start')
    @UseGuards(SubscriptionGuard)
    async startInterview(@Req() req: Request, @Body() body: Record<string, any>) {
        return this.onboardService.startInterview(this.getSessionKey(req), {
            personaKey: body.personaKey,
            questionCount: body.questionCount,
            company: body.company,
            jobTitle: body.jobTitle,
            jobDescription: body.jobDescription,
        })
    }

    @Post('onboard/interviews/:id/answer')
    @UseInterceptors(FileInterceptor('audio', { storage: memoryStorage() }))
    async answerInterview(
        @Req() req: Request,
        @Param('id') id: string,
        @UploadedFile() audio: Express.Multer.File | undefined,
        @Body() body: Record<string, any>,
    ) {
        return this.onboardService.answerInterview(
            this.getSessionKey(req),
            id,
            {
                audio,
                text: body.text,
            },
            this.getBaseUrl(req),
        )
    }

    @Get('onboard/interviews')
    async listInterviews(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        return this.onboardService.listInterviews(
            this.getSessionKey(req),
            Number(page || 1),
            Number(pageSize || 10),
            this.getBaseUrl(req),
        )
    }

    @Get('onboard/interviews/:id')
    async getInterview(@Req() req: Request, @Param('id') id: string) {
        return this.onboardService.getInterview(this.getSessionKey(req), id, this.getBaseUrl(req))
    }

    @Delete('onboard/interviews/:id')
    async deleteInterview(@Req() req: Request, @Param('id') id: string) {
        return this.onboardService.deleteInterview(this.getSessionKey(req), id)
    }

    @Get('onboard/interviews/:id/pdf')
    async downloadInterviewPdf(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') id: string,
    ) {
        const file = await this.onboardService.downloadInterviewPdf(this.getSessionKey(req), id)
        res.redirect(file.url)
    }

    private getSessionKey(req: Request) {
        const bearerToken = this.extractBearerToken(req.header('authorization'))
        const userId = bearerToken ? this.extractUserIdFromToken(bearerToken) : null
        if (userId) {
            return userId
        }

        const fallback = req.header('x-session-id') || req.header('x-demo-session-id')
        if (fallback?.trim()) {
            return fallback.trim()
        }

        throw new UnauthorizedException('Authentication required')
    }

    private getBaseUrl(req: Request) {
        return `${req.protocol}://${req.get('host')}`
    }

    private extractBearerToken(authorization?: string) {
        if (!authorization) {
            return null
        }

        const [scheme, token] = authorization.split(' ', 2)
        if (scheme?.toLowerCase() !== 'bearer' || !token?.trim()) {
            return null
        }

        return token.trim()
    }

    private extractUserIdFromToken(token: string) {
        const [, payloadSegment] = token.split('.')
        if (!payloadSegment) {
            return null
        }

        try {
            const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
            const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
            const payload = JSON.parse(
                Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8'),
            ) as { sub?: unknown }

            return typeof payload.sub === 'string' && payload.sub.trim()
                ? payload.sub.trim()
                : null
        } catch {
            return null
        }
    }
}
