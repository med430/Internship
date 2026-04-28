import {CreateExperienceDTO} from "../../../../API/http/experience/dto/create-experience.dto";

export class CreateExperienceCommand {
    constructor(
        public readonly userId: string,
        public readonly dto: CreateExperienceDTO
    ) {}
}