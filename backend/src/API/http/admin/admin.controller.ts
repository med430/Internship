import { BadRequestException, Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { GetUsersQuery } from '../../../Application/Features/UserFeature/Queries/get-users.query'
import { GetOffersQuery } from '../../../Application/Features/OfferFeature/Queries/get-offers.query'
import { GetApplicationsQuery } from '../../../Application/Features/ApplicationFeature/Queries/get-applications.query'
import { GetInterviewsQuery } from '../../../Application/Features/InterviewFeature/Queries/get-interviews.query'
import { UpdateUserRoleCommand } from '../../../Application/Features/UserFeature/Commands/update-user-role.command'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {

    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    @Get('users')
    getUsers(
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '50',
    ) {
        return this.queryBus.execute(
            new GetUsersQuery(Number(page), Number(pageSize)),
        )
    }

    @Get('offers')
    getOffers(
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '50',
    ) {
        return this.queryBus.execute(
            new GetOffersQuery(Number(page), Number(pageSize)),
        )
    }

    @Get('applications')
    getApplications(
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '50',
    ) {
        return this.queryBus.execute(
            new GetApplicationsQuery(Number(page), Number(pageSize)),
        )
    }

    @Patch('users/:id/role')
    promoteUser(
        @Param('id') id: string,
        @Body('role') role: string,
    ) {
        const upper = role?.toUpperCase()
        if (!Object.values(Role).includes(upper as Role)) {
            throw new BadRequestException(`Invalid role: ${role}`)
        }
        return this.commandBus.execute(new UpdateUserRoleCommand(id, upper as Role))
    }

    @Get('stats')
    async getStats() {
        const [users, offers, applications, interviews] = await Promise.all([
            this.queryBus.execute(new GetUsersQuery(1, 1000)),
            this.queryBus.execute(new GetOffersQuery(1, 1000)),
            this.queryBus.execute(new GetApplicationsQuery(1, 1000)),
            this.queryBus.execute(new GetInterviewsQuery(1, 1000)),
        ])

        return {
            users: (users as unknown[]).length,
            offers: (offers as unknown[]).length,
            applications: (applications as unknown[]).length,
            interviews: (interviews as unknown[]).length,
        }
    }
}