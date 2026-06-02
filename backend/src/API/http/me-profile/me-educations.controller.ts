// Student-facing education CRUD for the current student. Mirrors /me/skills; dispatches the same commands the /educations controller uses.

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
import { CreateEducationDTO } from '../education/dto/create-education.dto'
import { UpdateEducationDTO } from '../education/dto/update-education.dto'
import { CreateEducationCommand } from '../../../Application/Features/EducationFeature/Commands/create-education.command'
import { UpdateEducationCommand } from '../../../Application/Features/EducationFeature/Commands/update-education.command'
import { DeleteEducationCommand } from '../../../Application/Features/EducationFeature/Commands/delete-education.command'

@Controller('me/educations')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class MeEducationsController {

    constructor(private readonly bus: CommandBus) {}

    @Post()
    create(@SupabaseUser() user: ResolvedUser, @Body() dto: CreateEducationDTO) {
        return this.bus.execute(new CreateEducationCommand(
            user.id, dto.school, dto.degree, dto.field, dto.startDate, dto.endDate, dto.description,
        ))
    }

    @Patch(':id')
    update(@SupabaseUser() user: ResolvedUser, @Param('id') id: string, @Body() dto: UpdateEducationDTO) {
        return this.bus.execute(new UpdateEducationCommand(
            user.id, id, dto.school, dto.degree, dto.field, dto.startDate, dto.endDate, dto.description,
        ))
    }

    @Delete(':id')
    remove(@SupabaseUser() user: ResolvedUser, @Param('id') id: string) {
        return this.bus.execute(new DeleteEducationCommand(user.id, id))
    }
}
