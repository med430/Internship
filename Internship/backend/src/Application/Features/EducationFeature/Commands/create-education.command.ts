import {CreateEducationDTO} from "../../../../API/http/education/dto/create-education.dto";

export class CreateEducationCommand {
    constructor(
        public readonly userId: string,
        public readonly dto: CreateEducationDTO
    ) {}
}