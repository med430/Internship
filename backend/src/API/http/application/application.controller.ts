import {
    Controller,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
    Get,
    Res,
    Inject,
} from '@nestjs/common'

import type { Response } from 'express'
import { CommandBus } from '@nestjs/cqrs'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { CurrentUser } from '../decorators/current-user.decorator'

import { ApplyToOfferCommand } from '../../../Application/Features/ApplicationFeature/Commands/apply-offer.command'
import { UpdateApplicationStatusCommand } from '../../../Application/Features/ApplicationFeature/Commands/update-application-status.command'
import { WithdrawApplicationCommand } from '../../../Application/Features/ApplicationFeature/Commands/withdraw-application.command'
import { DownloadApplicationFileCommand } from '../../../Application/Features/ApplicationFeature/Commands/download-file.command'
import { FileStorageService } from '../../../Application/Services/FileStorageService/FileStorageService'

import { ApplicationStatus } from '../../../Domain/enums/application-status.enum'


@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {

    constructor(
        private readonly commandBus: CommandBus,
        @Inject(FileStorageService)
        private readonly fileStorage: FileStorageService,
    ) {}

    @Post()
    @Roles(Role.STUDENT)
    apply(
        @Body() dto: {
            offerId: string
            cvId: string
            coverLetterId?: string
        },
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new ApplyToOfferCommand(
                user.id,
                dto.offerId,
                dto.cvId,
                dto.coverLetterId
            )
        )
    }

    // ================= ACCEPT =================
    @Patch(':id/accept')
    @Roles(Role.RECRUITER)
    accept(
        @Param('id') id: string,
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new UpdateApplicationStatusCommand(
                id,
                user.id,
                ApplicationStatus.ACCEPTED
            )
        )
    }

    // ================= REJECT =================
    @Patch(':id/reject')
    @Roles(Role.RECRUITER)
    reject(
        @Param('id') id: string,
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new UpdateApplicationStatusCommand(
                id,
                user.id,
                ApplicationStatus.REJECTED
            )
        )
    }

    // ================= DOWNLOAD CV =================
    @Get(':id/cv')
    @Roles(Role.RECRUITER)
    async downloadCV(
        @Param('id') id: string,
        @CurrentUser() user,
        @Res() res: Response
    ) {
        const fileUrl: string = await this.commandBus.execute(
            new DownloadApplicationFileCommand(id, user.id, 'cv')
        )
        return this.sendFile(res, fileUrl)
    }

    // ================= DOWNLOAD LETTER =================
    @Get(':id/cover-letter')
    @Roles(Role.RECRUITER)
    async downloadCoverLetter(
        @Param('id') id: string,
        @CurrentUser() user,
        @Res() res: Response
    ) {
        const fileUrl: string = await this.commandBus.execute(
            new DownloadApplicationFileCommand(id, user.id, 'coverLetter')
        )
        return this.sendFile(res, fileUrl)
    }

    private async sendFile(res: Response, fileUrl: string) {
        // Always stream via downloadFileBuffer:
        // - LocalFileStorageService reads from disk
        // - CloudinaryStorageService generates a signed URL and fetches the buffer
        //   (Cloudinary private resources cannot be accessed via bare redirect)
        const buffer = await this.fileStorage.downloadFileBuffer(fileUrl)
        const filename = fileUrl.split('/').pop() ?? 'document.pdf'
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
        res.setHeader('Content-Length', buffer.length)
        return res.send(buffer)
    }

    // ================= WITHDRAW =================
    @Patch(':id/withdraw')
    @Roles(Role.STUDENT)
    withdraw(
        @Param('id') id: string,
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new WithdrawApplicationCommand(id, user.id)
        )
    }
}