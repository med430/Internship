import { CommandBus } from '@nestjs/cqrs';
import { AssignSkillDTO } from "./dto/assign-skill.dto";
import { UpdateSkillDTO } from "./dto/update-skill.dto";
export declare class SkillAssignmentController {
    private readonly commandBus;
    constructor(commandBus: CommandBus);
    assign(dto: AssignSkillDTO, user: any): Promise<any>;
    update(id: string, dto: UpdateSkillDTO, user: any): Promise<any>;
    remove(id: string, user: any): Promise<any>;
}
