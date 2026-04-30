import {UpdateEducationDTO} from "../../../../API/http/education/dto/update-education.dto";

export class UpdateEducationCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string,
        public readonly school?: string,
        public readonly degree?: string,
        public readonly field?: string,
        public readonly startDate?: Date,
        public readonly endDate?: Date,
        public readonly description?: string
    ) {}
}