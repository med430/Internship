import { CommandBus } from '@nestjs/cqrs';
import { CreateExperienceDTO } from './dto/create-experience.dto';
import { UpdateExperienceDTO } from './dto/update-experience.dto';
export declare class ExperienceController {
    private readonly bus;
    constructor(bus: CommandBus);
    create(dto: CreateExperienceDTO, user: any): Promise<any>;
    update(id: string, dto: UpdateExperienceDTO, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
