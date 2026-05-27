import {
    BadRequestException,
    Body,
    Controller,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { CurrentUser } from '../decorators/current-user.decorator'

import { StartInterviewDTO } from './dto/start-interview.dto'
import { StartInterviewCommand } from '../../../Application/Features/InterviewFeature/Commands/start-interview.command'
import { AnswerInterviewCommand } from '../../../Application/Features/InterviewFeature/Commands/answer-interview.command'

@Controller('interviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class InterviewController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('start')
    start(@Body() dto: StartInterviewDTO, @CurrentUser() user) {
        return this.commandBus.execute(
            new StartInterviewCommand(
                user.id,
                dto.offerId,
                dto.company,
                dto.jobTitle,
                dto.jobDescription,
                dto.recruiterMode,
                dto.questionCount,
            )
        )
    }

    @Post(':id/answer')
    @UseInterceptors(
        FileInterceptor('audio', {
            storage: memoryStorage(),
            limits: { fileSize: 25 * 1024 * 1024 },
            fileFilter: (_, file, cb) => {
                const mimetype = file.mimetype || ''
                const ok = mimetype.startsWith('audio/') || mimetype === 'video/webm' || mimetype === 'video/mp4'
                if (!ok) return cb(new BadRequestException('Invalid audio type'), false)
                cb(null, true)
            }
        })
    )
    answer(
        @Param('id') id: string,
        @UploadedFile() audio: Express.Multer.File,
        @CurrentUser() user,
    ) {
        if (!audio) throw new BadRequestException('Audio is required')

        return this.commandBus.execute(
            new AnswerInterviewCommand(user.id, id, audio)
        )
    }
}
