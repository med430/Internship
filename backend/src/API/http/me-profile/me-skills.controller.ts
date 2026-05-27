// Student-facing skill CRUD for their own profile. Dispatches to the same handlers the team's /skill-assignments controller uses.

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
import { AssignSkillCommand } from '../../../Application/Features/SkillAssignmentFeature/Commands/assign-skill.command'
import { UpdateSkillCommand } from '../../../Application/Features/SkillAssignmentFeature/Commands/update-skill.command'
import { RemoveSkillCommand } from '../../../Application/Features/SkillAssignmentFeature/Commands/remove-skill.command'
import { AddMySkillDto, UpdateMySkillDto } from './dto/skill-assignment.dto'

@Controller('me/skills')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class MeSkillsController {

    constructor(private readonly commandBus: CommandBus) {}

    // Adds a new skill row for the current student.
    @Post()
    async add(@SupabaseUser() user: ResolvedUser, @Body() dto: AddMySkillDto) {
        await this.commandBus.execute(new AssignSkillCommand(user.id, dto.skillId, dto.level))
        return { ok: true }
    }

    // Updates the level on one of the student's assignments.
    @Patch(':assignmentId')
    async update(
        @SupabaseUser() user: ResolvedUser,
        @Param('assignmentId') assignmentId: string,
        @Body() dto: UpdateMySkillDto,
    ) {
        await this.commandBus.execute(new UpdateSkillCommand(user.id, assignmentId, dto.level))
        return { ok: true }
    }

    @Delete(':assignmentId')
    async remove(@SupabaseUser() user: ResolvedUser, @Param('assignmentId') assignmentId: string) {
        await this.commandBus.execute(new RemoveSkillCommand(user.id, assignmentId))
        return { ok: true }
    }
}
