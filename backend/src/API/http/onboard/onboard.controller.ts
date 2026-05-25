import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Param,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UploadedFiles,
    UnauthorizedException,
    UseInterceptors,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { OnboardService } from './onboard.service'
import { UpdatePublicProfileDto } from './dto/update-public-profile.dto'
import { AnyFilesInterceptor } from '@nestjs/platform-express'

@Controller()
export class OnboardController {
    constructor(private readonly onboardService: OnboardService) {}

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

    @Post('jobs/filter')
    async filterJobs(@Body() body: Record<string, any>) {
        return this.onboardService.filterJobs(body, body.resume_content, body.limit)
    }

    @Post('jobs/match')
    async matchJobs(@Body() body: Record<string, any>) {
        if (!body.resume_content) {
            throw new BadRequestException('resume_content is required')
        }

        return this.onboardService.matchJobs(body.resume_content, body.limit)
    }

    @Get('virtual-interviewer/personas')
    async personas() {
        return this.onboardService.listPersonas()
    }

    @Post('generate_queries')
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
