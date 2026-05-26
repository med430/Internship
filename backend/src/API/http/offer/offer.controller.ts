import {
    Controller,
    Post,
    Patch,
    Param,
    Body,
    UseGuards
} from '@nestjs/common'

import { CommandBus } from '@nestjs/cqrs'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { CurrentUser } from '../decorators/current-user.decorator'

import { CreateOfferDTO } from './dto/create-offer.dto'
import { UpdateOfferDTO } from './dto/update-offer.dto'

import { CreateOfferCommand } from '../../../Application/Features/OfferFeature/Commands/create-offer.command'
import { UpdateOfferCommand } from '../../../Application/Features/OfferFeature/Commands/update-offer.command'
import { DeleteOfferCommand } from '../../../Application/Features/OfferFeature/Commands/delete-offer.command'
@Controller('offers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RECRUITER)
export class OfferController {

    constructor(private readonly bus: CommandBus) {}

    @Post()
    create(
        @Body() dto: CreateOfferDTO,
        @CurrentUser() user
    ) {
        return this.bus.execute(
            new CreateOfferCommand(
                user.id,
                dto.title,
                dto.description,
                dto.company,
                dto.location,
                dto.domain,
                dto.isPaid,
                dto.workMode,
                new Date(dto.startDate),
                new Date(dto.endDate),
                dto.type,
                dto.requiredSkills
            )
        )
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateOfferDTO,
        @CurrentUser() user
    ) {
        return this.bus.execute(
            new UpdateOfferCommand(
                id,
                user.id,
                dto.title,
                dto.description,
                dto.company,
                dto.location,
                dto.domain,
                dto.isPaid,
                dto.workMode,
                dto.startDate ? new Date(dto.startDate) : undefined,
                dto.endDate ? new Date(dto.endDate) : undefined,
                dto.type,
                dto.requiredSkills
            )
        )
    }

    @Patch(':id/delete')
    delete(
        @Param('id') id: string,
        @CurrentUser() user
    ) {
        return this.bus.execute(
            new DeleteOfferCommand(id, user.id)
        )
    }
}