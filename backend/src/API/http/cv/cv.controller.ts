import {
    Controller,
    Post,
    Get,
    Param,
    Res,
    UseGuards, UseInterceptors, BadRequestException, UploadedFile, Patch, Inject,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
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
}