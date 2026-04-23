import {
    Controller,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Get,
    Res
} from '@nestjs/common'
import type { Response } from 'express'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'

import { ApplyOfferDTO } from "./dto/apply-offer.dto"
import { ApplyToOfferCommand } from "../../../Application/Features/ApplicationFeature/Commands/apply-offer.command"
import { UpdateApplicationStatusCommand } from "../../../Application/Features/ApplicationFeature/Commands/update-application-status.command"
import { DownloadCvCommand } from "../../../Application/Features/ApplicationFeature/Commands/download-cv.command"

@Controller('applications')
export class ApplicationController {

    constructor(private readonly commandBus: CommandBus) {}

    // ================= APPLY =================
    @Post('apply')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('cv', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueName =
                        Date.now() +
                        '-' +
                        Math.round(Math.random() * 1e9) +
                        extname(file.originalname)

                    callback(null, uniqueName)
                },
            }),
        }),
    )
    async apply(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: ApplyOfferDTO,
        @CurrentUser() user
    ) {

        if (!file) {
            throw new BadRequestException('CV is required')
        }

        const cvUrl = `/uploads/${file.filename}`

        return this.commandBus.execute(
            new ApplyToOfferCommand(
                user.id,
                dto.offerId,
                cvUrl
            )
        )
    }

    // ================= ACCEPT =================
    @Patch(':id/accept')
    @UseGuards(JwtAuthGuard)
    accept(
        @Param('id') id: string,
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new UpdateApplicationStatusCommand(
                id,
                user.id,
                'ACCEPTED'
            )
        )
    }

    // ================= REJECT =================
    @Patch(':id/reject')
    @UseGuards(JwtAuthGuard)
    reject(
        @Param('id') id: string,
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new UpdateApplicationStatusCommand(
                id,
                user.id,
                'REJECTED'
            )
        )
    }

    // ================= DOWNLOAD CV =================
    @Get(':id/cv')
    @UseGuards(JwtAuthGuard)
    async downloadCV(
        @Param('id') applicationId: string,
        @CurrentUser() user,
        @Res() res: Response
    ) {

        const filePath = await this.commandBus.execute(
            new DownloadCvCommand(applicationId, user.id)
        )

        return res.download(filePath)
    }
}