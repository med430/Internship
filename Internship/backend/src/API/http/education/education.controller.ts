import {
    Controller,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
    Delete
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'
import {CreateEducationDTO} from "./dto/create-education.dto";
import {CreateEducationCommand} from "../../../Application/Features/EducationFeature/Commands/create-education.command";
import {UpdateEducationDTO} from "./dto/update-education.dto";
import {UpdateEducationCommand} from "../../../Application/Features/EducationFeature/Commands/update-education.command";
import {DeleteEducationCommand} from "../../../Application/Features/EducationFeature/Commands/delete-education.command";


@Controller('educations')
@UseGuards(JwtAuthGuard)
export class EducationController {

    constructor(private bus: CommandBus) {}

    @Post()
    create(@Body() dto: CreateEducationDTO, @CurrentUser() user) {
        return this.bus.execute(
            new CreateEducationCommand(user.id, dto)
        )
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateEducationDTO,
        @CurrentUser() user
    ) {
        return this.bus.execute(
            new UpdateEducationCommand(user.id, id, dto)
        )
    }

    @Delete(':id')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.bus.execute(
            new DeleteEducationCommand(user.id, id)
        )
    }
}