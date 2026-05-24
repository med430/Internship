import { CommandBus } from '@nestjs/cqrs';
import { CreateEducationDTO } from './dto/create-education.dto';
import { UpdateEducationDTO } from './dto/update-education.dto';
export declare class EducationController {
    private readonly bus;
    constructor(bus: CommandBus);
    create(dto: CreateEducationDTO, user: any): Promise<any>;
    update(id: string, dto: UpdateEducationDTO, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
