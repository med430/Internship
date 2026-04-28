import {UpdateEducationDTO} from "../../../../API/http/education/dto/update-education.dto";

export class UpdateEducationCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string,
        public readonly dto: UpdateEducationDTO
    ) {}
}