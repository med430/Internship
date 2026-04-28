import {UpdateProjectDTO} from "../../../../API/http/project/dto/update-project.dto";

export class UpdateProjectCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string,
        public readonly dto: UpdateProjectDTO
    ) {}
}