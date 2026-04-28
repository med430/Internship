
import { Controller, Patch, Delete, Body, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'

import { SoftDeleteUserCommand } from '../../../Application/Features/ProfileFeature/Commands/soft-delete-user.command'
import {UpdateProfileDto} from "./dto/update-profile.dto";
import {UpdateUserCommand} from "../../../Application/Features/ProfileFeature/Commands/update-user.command";

@Controller()
export class ProfileController {
    constructor(private readonly commandBus: CommandBus) {}

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    updateMe(@Body() dto: UpdateProfileDto, @CurrentUser() user) {
        return this.commandBus.execute(
            new UpdateUserCommand(user.id, dto)
        )
    }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    deleteMe(@CurrentUser() user) {
        return this.commandBus.execute(
            new SoftDeleteUserCommand(user.id)
        )
    }
}