import {
    Controller,
    Post,
    Get,
    Param,
    Res,
    UseGuards, UseInterceptors, BadRequestException, UploadedFile, Patch, Inject, NotFoundException,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ICVRepository } from '../../../Application/repositories/cv.repository'
import { IStudentProfileRepository } from '../../../Application/repositories/student-profile.repository'
import type { Response } from 'express'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { CurrentUser } from '../decorators/current-user.decorator'
import {FileInterceptor} from "@nestjs/platform-express";
import {memoryStorage} from "multer";
import {UploadCVCommand} from "../../../Application/Features/CvFeature/Commands/upload-cv.command";
import {DeleteCVCommand} from "../../../Application/Features/CvFeature/Commands/delete-cv.command";
import {DownloadOwnCVCommand} from "../../../Application/Features/CvFeature/Commands/download-own-cv.command";
import { FileStorageService } from '../../../Application/Services/FileStorageService/FileStorageService'

@Controller('cvs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class CVController {

    constructor(
        private readonly commandBus: CommandBus,
        @Inject(FileStorageService)
        private readonly fileService: FileStorageService,
        @Inject(ICVRepository)
        private readonly cvRepo: ICVRepository,
        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
    ) {}

    @Post()
    @UseInterceptors(
        FileInterceptor('cv', {
            storage: memoryStorage(),
            limits: { fileSize: 2 * 1024 * 1024 },
            fileFilter: (_, file, cb) => {
                if (file.mimetype !== 'application/pdf')
                    return cb(new BadRequestException('Only PDF allowed'), false)
                cb(null, true)
            }
        })
    )
    async upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user) {
        if (!file) throw new BadRequestException('CV required')
        return this.commandBus.execute(
            new UploadCVCommand(user.id, file)
        )
    }

    @Get(':id/download')
    async download(@Param('id') id: string, @CurrentUser() user, @Res() res: Response) {
        const fileUrl = await this.commandBus.execute(
            new DownloadOwnCVCommand(user.id, id)
        )
        const buffer = await this.fileService.downloadFileBuffer(fileUrl)
        res.set('Content-Type', 'application/pdf')
        res.set('Content-Disposition', `inline; filename="cv_${id}.pdf"`)
        res.set('Content-Length', buffer.length.toString())
        res.send(buffer)
    }

    @Patch(':id/delete')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.commandBus.execute(new DeleteCVCommand(user.id, id))
    }

    @Get()
    async list(@CurrentUser() user) {
        const profile = await this.studentRepo.findByUserId(user.id)
        if (!profile) throw new NotFoundException('Profile not found')

        const all = await this.cvRepo.findByStudent(profile.id)
        const cvs = all.map((c) => ({
            id: c.id,
            user_id: c.studentId,
            pdf_url: `/cvs/${c.id}/download`,
            original_score: 0,
            final_score: 0,
            job_title: '',
            jobs_summary: '',
            review_improvements: [],
            anonymized_cv_text: null,
            created_at: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
        }))

        return {
            cvs,
            total: cvs.length,
            page: 1,
            pageSize: cvs.length,
            totalPages: Math.max(1, Math.ceil(cvs.length / (cvs.length || 1))),
        }
    }
}