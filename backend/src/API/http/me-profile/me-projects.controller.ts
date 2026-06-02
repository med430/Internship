// Student-facing project CRUD for the current student. Mirrors /me/skills; dispatches the same commands the /projects controller uses.

import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { SupabaseUser } from '../decorators/supabase-user.decorator'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'
import { CreateProjectDTO } from '../project/dto/create-project.dto'
import { UpdateProjectDTO } from '../project/dto/update-project.dto'
import { CreateProjectCommand } from '../../../Application/Features/ProjectFeature/Commands/create-project.command'
import { UpdateProjectCommand } from '../../../Application/Features/ProjectFeature/Commands/update-project.command'
import { DeleteProjectCommand } from '../../../Application/Features/ProjectFeature/Commands/delete-project.command'

@Controller('me/projects')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class MeProjectsController {

    constructor(private readonly bus: CommandBus) {}

    @Post()
    create(@SupabaseUser() user: ResolvedUser, @Body() dto: CreateProjectDTO) {
        return this.bus.execute(new CreateProjectCommand(
            user.id, dto.title, dto.description, dto.technologies, dto.githubUrl, dto.demoUrl,
        ))
    }

    @Patch(':id')
    update(@SupabaseUser() user: ResolvedUser, @Param('id') id: string, @Body() dto: UpdateProjectDTO) {
        return this.bus.execute(new UpdateProjectCommand(
            user.id, id, dto.title, dto.description, dto.technologies, dto.githubUrl, dto.demoUrl,
        ))
    }

    @Delete(':id')
    remove(@SupabaseUser() user: ResolvedUser, @Param('id') id: string) {
        return this.bus.execute(new DeleteProjectCommand(user.id, id))
    }
}
