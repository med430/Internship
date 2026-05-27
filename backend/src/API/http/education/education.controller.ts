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
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { CurrentUser } from '../decorators/current-user.decorator'

import { CreateEducationDTO } from './dto/create-education.dto'
import { UpdateEducationDTO } from './dto/update-education.dto'

import { CreateEducationCommand } from '../../../Application/Features/EducationFeature/Commands/create-education.command'
import { UpdateEducationCommand } from '../../../Application/Features/EducationFeature/Commands/update-education.command'
import { DeleteEducationCommand } from '../../../Application/Features/EducationFeature/Commands/delete-education.command'

@Controller('educations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class EducationController {

    constructor(private readonly bus: CommandBus) {}

    @Post()
    create(@Body() dto: CreateEducationDTO, @CurrentUser() user) {
        return this.bus.execute(
            new CreateEducationCommand(
                user.id,
                dto.school,
                dto.degree,
                dto.field,
                dto.startDate,
                dto.endDate,
                dto.description
            )
        )
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateEducationDTO,
        @CurrentUser() user
    ) {
        return this.bus.execute(
            new UpdateEducationCommand(
                user.id,
                id,
                dto.school,
                dto.degree,
                dto.field,
                dto.startDate,
                dto.endDate,
                dto.description
            )
        )
    }

    @Patch(':id')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.bus.execute(
            new DeleteEducationCommand(user.id, id)
        )
    }
}