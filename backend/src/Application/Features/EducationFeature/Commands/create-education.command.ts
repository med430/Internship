import {CreateEducationDTO} from "../../../../API/http/education/dto/create-education.dto";

export class CreateEducationCommand {
    constructor(
        public readonly userId: string,
        public readonly school: string,
        public readonly degree: string,
        public readonly field: string,
        public readonly startDate: Date,
        public readonly endDate?: Date,
        public readonly description?: string
    ) {}
}