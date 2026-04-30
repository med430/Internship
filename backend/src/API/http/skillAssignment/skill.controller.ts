
import {Controller, Patch, Delete, Body, UseGuards, Post, Param} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'

import {AssignSkillDTO} from "./dto/assign-skill.dto";
import { UpdateSkillCommand } from "src/Application/Features/SkillAssignmentFeature/Commands/update-skill.command"
import {AssignSkillCommand} from "../../../Application/Features/SkillAssignmentFeature/Commands/assign-skill.command";
import { UpdateSkillDTO } from "./dto/update-skill.dto"
import {RemoveSkillCommand} from "../../../Application/Features/SkillAssignmentFeature/Commands/remove-skill.command";
@Controller('skill-assignments')
@UseGuards(JwtAuthGuard)
export class SkillAssignmentController {

    constructor(private readonly commandBus: CommandBus) {}

    @Post()
    assign(
        @Body() dto: AssignSkillDTO,
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new AssignSkillCommand(
                user.id,
                dto.skillId,
                dto.level
            )
        )
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateSkillDTO,
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new UpdateSkillCommand(
                user.id,
                id,
                dto.level
            )
        )
    }

    @Delete(':id')
    remove(
        @Param('id') id: string,
        @CurrentUser() user
    ) {
        return this.commandBus.execute(
            new RemoveSkillCommand(user.id, id)
        )
    }
}