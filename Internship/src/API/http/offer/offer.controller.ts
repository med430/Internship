import {
    Body,
    Controller,
    Post,
    Put,
    Delete,
    Param,
    UseGuards
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'


import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import {CreateOfferDTO} from "./dto/create-offer.dto";
import {Roles} from "../guards/roles.decorator";
import {CreateOfferCommand} from "../../../Application/Features/OfferFeature/Commands/create-offer.command";
import {UpdateOfferCommand} from "../../../Application/Features/OfferFeature/Commands/update-offer.command";
import {DeleteOfferCommand} from "../../../Application/Features/OfferFeature/Commands/delete-offer.command";
import {User} from "../../../Domain/entities/user.entity";
import {CurrentUser} from "../decorators/current-user.decorator";

@Controller('offers')
export class OfferController {

    constructor(private readonly commandBus: CommandBus) {}

    // 🔥 CREATE OFFER
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECRUITER', 'TEACHER')
    createOffer(
        @Body() dto: CreateOfferDTO,
        @CurrentUser() user: User
    ) {
        return this.commandBus.execute(
            new CreateOfferCommand(dto, user.id)
        )
    }

    // 🔄 UPDATE OFFER
    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECRUITER', 'TEACHER')
    updateOffer(
        @Param('id') id: string,
        @Body() dto: Partial<CreateOfferDTO>,
        @CurrentUser() user: User
    ) {
        return this.commandBus.execute(
            new UpdateOfferCommand(id, dto, user.id)
        )
    }

    // 🗑️ DELETE OFFER (SOFT DELETE)
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('RECRUITER', 'TEACHER')
    deleteOffer(
        @Param('id') id: string,
        @CurrentUser() user: User
    ) {
        return this.commandBus.execute(
            new DeleteOfferCommand(id, user.id)
        )
    }
}