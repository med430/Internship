import {UpdateExperienceDTO} from "../../../../API/http/experience/dto/update-experience.dto";

export class UpdateExperienceCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string,
        public readonly dto: UpdateExperienceDTO
    ) {}
}