import {UpdateCertificationDTO} from "../../../../API/http/certification/dto/update-certification.dto";

export class UpdateCertificationCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string,
        public readonly dto: UpdateCertificationDTO
    ) {}
}