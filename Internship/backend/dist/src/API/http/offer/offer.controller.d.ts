import { CommandBus } from '@nestjs/cqrs';
import { CreateOfferDTO } from './dto/create-offer.dto';
import { UpdateOfferDTO } from './dto/update-offer.dto';
export declare class OfferController {
    private readonly bus;
    constructor(bus: CommandBus);
    create(dto: CreateOfferDTO, user: any): Promise<any>;
    update(id: string, dto: UpdateOfferDTO, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
