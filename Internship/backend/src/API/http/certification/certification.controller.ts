import {
    Controller,
    Post,
    Patch,
    Param,
    Body,
    UseGuards, Delete,

} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'
import {CreateCertificationDTO} from "./dto/create-certification.dto";
import {
    CreateCertificationCommand
} from "../../../Application/Features/CertificationFeature/Commands/create-certification.command";
import {
    UpdateCertificationCommand
} from "../../../Application/Features/CertificationFeature/Commands/update-certification.command";
import {
    DeleteCertificationCommand
} from "../../../Application/Features/CertificationFeature/Commands/delete-certification.command";
import {UpdateCertificationDTO} from "./dto/update-certification.dto";

@Controller('certifications')
@UseGuards(JwtAuthGuard)
export class CertificationController {

    constructor(private bus: CommandBus) {}

    @Post()
    create(@Body() dto: CreateCertificationDTO, @CurrentUser() user) {
        return this.bus.execute(
            new CreateCertificationCommand(user.id, dto)
        )
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateCertificationDTO,
        @CurrentUser() user
    ) {
        return this.bus.execute(
            new UpdateCertificationCommand(user.id, id, dto)
        )
    }

    @Delete(':id')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.bus.execute(
            new DeleteCertificationCommand(user.id, id)
        )
    }
}