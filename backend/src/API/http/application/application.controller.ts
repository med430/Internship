import {
    Controller,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
    Get,
    Res,
} from '@nestjs/common'

import type { Response } from 'express'
import { CommandBus } from '@nestjs/cqrs'


import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'

import { ApplyToOfferCommand } from '../../../Application/Features/ApplicationFeature/Commands/apply-offer.command'
import { UpdateApplicationStatusCommand } from '../../../Application/Features/ApplicationFeature/Commands/update-application-status.command'
import { WithdrawApplicationCommand } from '../../../Application/Features/ApplicationFeature/Commands/withdraw-application.command'
import { DownloadApplicationFileCommand } from '../../../Application/Features/ApplicationFeature/Commands/download-file.command'

import { ApplicationStatus } from '../../../Domain/enums/application-status.enum'


@Controller('applications')
export class ApplicationController {

    constructor(
        private readonly commandBus: CommandBus,

    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    async downloadCV(
        @Param('id') id: string,
        @CurrentUser() user,
        @Res() res: Response
    ) {
        const fileUrl = await this.commandBus.execute(
            new DownloadApplicationFileCommand(id, user.id, 'cv')
        )

        return res.redirect(fileUrl)
    }

    // ================= DOWNLOAD LETTER =================
    @Get(':id/cover-letter')
    @UseGuards(JwtAuthGuard)
    async downloadCoverLetter(
        @Param('id') id: string,
        @CurrentUser() user,
        @Res() res: Response
    ) {
        const fileUrl = await this.commandBus.execute(
            new DownloadApplicationFileCommand(id, user.id, 'coverLetter')
        )

        return res.redirect(fileUrl)
    }

    // ================= WITHDRAW =================
    @Patch(':id/withdraw')
    @UseGuards(JwtAuthGuard)
    withdraw(
        @Param('id') id: string,
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new WithdrawApplicationCommand(id, user.id)
        )
    }
}