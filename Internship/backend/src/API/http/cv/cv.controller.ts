import {
    Controller,
    Post,
    Param,
    UseGuards, Delete, Inject, UseInterceptors, BadRequestException, UploadedFile, Patch,

} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'
import {FileStorageService} from "../../../Application/Services/FileStorageService/FileStorageService";
import {FileInterceptor} from "@nestjs/platform-express";
import {randomUUID} from "crypto";
import {diskStorage} from "multer";
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
            storage: diskStorage({
                destination: './uploads/cvs',
                filename: (_, __, cb) => cb(null, `${randomUUID()}.pdf`)
            }),
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
            new UploadCVCommand(user.id, file)  // ← file, pas fileUrl
        )
    }

    @Patch(':id/delete')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.commandBus.execute(new DeleteCVCommand(user.id, id))
    }
}