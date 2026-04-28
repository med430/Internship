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

import { CreateExperienceDTO } from './dto/create-experience.dto'
import { UpdateExperienceDTO } from './dto/update-experience.dto'

import { CreateExperienceCommand } from '../../../Application/Features/ExperienceFeature/Commands/create-experience.command'
import { UpdateExperienceCommand } from '../../../Application/Features/ExperienceFeature/Commands/update-experience.command'
import { DeleteExperienceCommand } from '../../../Application/Features/ExperienceFeature/Commands/delete-experience.command'

@Controller('experiences')
@UseGuards(JwtAuthGuard)
export class ExperienceController {

    constructor(private readonly bus: CommandBus) {}

    @Post()
    create(@Body() dto: CreateExperienceDTO, @CurrentUser() user) {
        return this.bus.execute(
            new CreateExperienceCommand(
                user.id,
                dto.company,
                dto.role,
                dto.startDate,
                dto.endDate,
                dto.description
            )
        )
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateExperienceDTO,
        @CurrentUser() user
    ) {
        return this.bus.execute(
            new UpdateExperienceCommand(
                user.id,
                id,
                dto.company,
                dto.role,
                dto.startDate,
                dto.endDate,
                dto.description
            )
        )
    }

    @Patch(':id')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.bus.execute(
            new DeleteExperienceCommand(user.id, id)
        )
    }
}