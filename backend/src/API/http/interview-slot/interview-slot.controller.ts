import { Controller, Post, Patch, Get, Body, Param, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { CurrentUser } from '../decorators/current-user.decorator'
import { Role } from '../../../Domain/enums/role.enum'

import { ProposeInterviewSlotCommand } from '../../../Application/Features/InterviewSlotFeature/Commands/propose-interview-slot.command'
import { RespondToInterviewSlotCommand } from '../../../Application/Features/InterviewSlotFeature/Commands/respond-to-interview-slot.command'
import { GetMyInterviewSlotsQuery } from '../../../Application/Features/InterviewSlotFeature/Queries/get-my-interview-slots.query'

@Controller('interview-slots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InterviewSlotController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    @Roles(Role.RECRUITER)
    propose(
        @Body() body: { applicationId: string; startAt: string; endAt: string; notes?: string; parentSlotId?: string },
        @CurrentUser() user,
    ) {
        return this.commandBus.execute(
            new ProposeInterviewSlotCommand(
                user.id,
                body.applicationId,
                new Date(body.startAt),
                new Date(body.endAt),
                body.notes,
                body.parentSlotId,
            )
        )
    }

    @Patch(':id/respond')
    @Roles(Role.STUDENT)
    respond(
        @Param('id') id: string,
        @Body() body: {
            action: 'accept' | 'decline' | 'counter'
            counterStartAt?: string
            counterEndAt?: string
            counterNotes?: string
        },
        @CurrentUser() user,
    ) {
        return this.commandBus.execute(
            new RespondToInterviewSlotCommand(
                user.id,
                id,
                body.action,
                body.counterStartAt ? new Date(body.counterStartAt) : undefined,
                body.counterEndAt ? new Date(body.counterEndAt) : undefined,
                body.counterNotes,
            )
        )
    }

    @Get('mine')
    @Roles(Role.STUDENT, Role.RECRUITER)
    getMine(@CurrentUser() user) {
        return this.queryBus.execute(
            new GetMyInterviewSlotsQuery(user.id, user.role)
        )
    }
}
