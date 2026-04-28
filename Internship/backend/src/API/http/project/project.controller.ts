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
import {CreateProjectDTO} from "./dto/create-project.dto";
import {CreateProjectCommand} from "../../../Application/Features/ProjectFeature/Commands/create-project.command";
import {UpdateProjectDTO} from "./dto/update-project.dto";
import {UpdateProjectCommand} from "../../../Application/Features/ProjectFeature/Commands/update-project.command";
import {DeleteProjectCommand} from "../../../Application/Features/ProjectFeature/Commands/delete-project.command";

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {

    constructor(private readonly bus: CommandBus) {}

    @Post()
    create(@Body() dto: CreateProjectDTO, @CurrentUser() user) {
        return this.bus.execute(
            new CreateProjectCommand(
                user.id,
                dto.title,
                dto.description,
                dto.technologies,
                dto.githubUrl,
                dto.demoUrl
            )
        )
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateProjectDTO,
        @CurrentUser() user
    ) {
        return this.bus.execute(
            new UpdateProjectCommand(
                user.id,
                id,
                dto.title,
                dto.description,
                dto.technologies,
                dto.githubUrl,
                dto.demoUrl
            )
        )
    }

    @Delete(':id')
    delete(@Param('id') id: string, @CurrentUser() user) {
        return this.bus.execute(
            new DeleteProjectCommand(user.id, id)
        )
    }
}