import { CommandBus } from '@nestjs/cqrs';
import { CreateProjectDTO } from "./dto/create-project.dto";
import { UpdateProjectDTO } from "./dto/update-project.dto";
export declare class ProjectController {
    private readonly bus;
    constructor(bus: CommandBus);
    create(dto: CreateProjectDTO, user: any): Promise<any>;
    update(id: string, dto: UpdateProjectDTO, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
