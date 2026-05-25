import {
    Controller,
    Post,
    Param,
    UseGuards, UseInterceptors, BadRequestException, UploadedFile, Patch,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'
import {FileInterceptor} from "@nestjs/platform-express";
import {memoryStorage} from "multer";
import {UploadCVCommand} from "../../../Application/Features/CvFeature/Commands/upload-cv.command";
import {DeleteCVCommand} from "../../../Application/Features/CvFeature/Commands/delete-cv.command";
@Controller('cvs')
@UseGuards(JwtAuthGuard)
export class CVController {

    constructor(
        private readonly commandBus: CommandBus  // ← seulement CommandBus
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

    @Patch(':id/delete')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.commandBus.execute(new DeleteCVCommand(user.id, id))
    }
}