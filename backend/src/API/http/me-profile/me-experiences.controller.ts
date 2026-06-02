// Student-facing experience CRUD for the current student. Mirrors /me/skills; dispatches the same commands the /experiences controller uses.

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
import { CreateExperienceDTO } from '../experience/dto/create-experience.dto'
import { UpdateExperienceDTO } from '../experience/dto/update-experience.dto'
import { CreateExperienceCommand } from '../../../Application/Features/ExperienceFeature/Commands/create-experience.command'
import { UpdateExperienceCommand } from '../../../Application/Features/ExperienceFeature/Commands/update-experience.command'
import { DeleteExperienceCommand } from '../../../Application/Features/ExperienceFeature/Commands/delete-experience.command'

@Controller('me/experiences')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class MeExperiencesController {

    constructor(private readonly bus: CommandBus) {}

    @Post()
    create(@SupabaseUser() user: ResolvedUser, @Body() dto: CreateExperienceDTO) {
        return this.bus.execute(new CreateExperienceCommand(
            user.id, dto.company, dto.role, dto.startDate, dto.endDate, dto.description,
        ))
    }

    @Patch(':id')
    update(@SupabaseUser() user: ResolvedUser, @Param('id') id: string, @Body() dto: UpdateExperienceDTO) {
        return this.bus.execute(new UpdateExperienceCommand(
            user.id, id, dto.company, dto.role, dto.startDate, dto.endDate, dto.description,
        ))
    }

    @Delete(':id')
    remove(@SupabaseUser() user: ResolvedUser, @Param('id') id: string) {
        return this.bus.execute(new DeleteExperienceCommand(user.id, id))
    }
}
