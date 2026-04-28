import {CreateProjectDTO} from "../../../../API/http/project/dto/create-project.dto";

export class CreateProjectCommand {
    constructor(
        public readonly userId: string,
        public readonly dto: CreateProjectDTO
    ) {}
}