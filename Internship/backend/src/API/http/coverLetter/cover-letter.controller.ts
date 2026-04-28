// cover-letter.controller.ts
import {
    Controller, Post, Delete, Param,
    UseGuards, UseInterceptors, UploadedFile,
    BadRequestException, Patch
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { randomUUID } from 'crypto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'
import { UploadCoverLetterCommand } from '../../../Application/Features/CoverLetterFeature/Commands/upload-cover-letter.command'
import { DeleteCoverLetterCommand } from '../../../Application/Features/CoverLetterFeature/Commands/delete-cover-letter.command'

@Controller('cover-letters')
@UseGuards(JwtAuthGuard)
export class CoverLetterController {

    constructor(
        private readonly commandBus: CommandBus  // ← seulement CommandBus
    ) {}

    @Post()
    @UseInterceptors(
        FileInterceptor('letter', {
            storage: diskStorage({
                destination: './uploads/letters',
                filename: (_, __, cb) => cb(null, `${randomUUID()}.pdf`)
            }),
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
            new UploadCoverLetterCommand(user.id, file)  // ← passe le file directement
        )
    }

    @Patch(':id/delete')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.commandBus.execute(
            new DeleteCoverLetterCommand(user.id, id)
        )
    }
}