import {CreateCertificationDTO} from "../../../../API/http/certification/dto/create-certification.dto";

export class CreateCertificationCommand {
    constructor(
        public readonly userId: string,
        public readonly dto: CreateCertificationDTO
    ) {}
}