import {
    Controller, Post, Get, Param, Res, Query,
    UseGuards, UseInterceptors, UploadedFile,
    BadRequestException, Patch
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import type { Response } from 'express'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'
import { UploadCoverLetterCommand } from '../../../Application/Features/CoverLetterFeature/Commands/upload-cover-letter.command'
import { DeleteCoverLetterCommand } from '../../../Application/Features/CoverLetterFeature/Commands/delete-cover-letter.command'
import { DownloadOwnCoverLetterCommand } from '../../../Application/Features/CoverLetterFeature/Commands/download-own-cover-letter.command'
import { ListOwnCoverLettersQuery } from '../../../Application/Features/CoverLetterFeature/Queries/list-own-cover-letters.query'
import { GetOwnCoverLetterQuery } from '../../../Application/Features/CoverLetterFeature/Queries/get-own-cover-letter.query'

@Controller('cover-letters')
@UseGuards(JwtAuthGuard)
export class CoverLetterController {

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    list(
        @CurrentUser() user,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        return this.queryBus.execute(
            new ListOwnCoverLettersQuery(user.id, Number(page || 1), Number(pageSize || 10))
        )
    }

    @Post()
    @UseInterceptors(
        FileInterceptor('letter', {
            storage: memoryStorage(),
            limits: { fileSize: 2 * 1024 * 1024 },
            fileFilter: (_, file, cb) => {
                if (file.mimetype !== 'application/pdf') {
                    return cb(new BadRequestException('Only PDF allowed'), false)
                }
                cb(null, true)
            }
        })
    )
    async upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user) {
        if (!file) throw new BadRequestException('Letter required')
        return this.commandBus.execute(
            new UploadCoverLetterCommand(user.id, file)
        )
    }

    @Get(':id/download')
    async download(@Param('id') id: string, @CurrentUser() user, @Res() res: Response) {
        const fileUrl = await this.commandBus.execute(
            new DownloadOwnCoverLetterCommand(user.id, id)
        )
        return res.redirect(fileUrl)
    }

    @Get(':id')
    getOne(@Param('id') id: string, @CurrentUser() user) {
        return this.queryBus.execute(new GetOwnCoverLetterQuery(user.id, id))
    }

    @Patch(':id/delete')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.commandBus.execute(
            new DeleteCoverLetterCommand(user.id, id)
        )
    }
}