import { CommandBus } from '@nestjs/cqrs';
import { CreateCertificationDTO } from "./dto/create-certification.dto";
import { UpdateCertificationDTO } from "./dto/update-certification.dto";
export declare class CertificationController {
    private readonly bus;
    constructor(bus: CommandBus);
    create(dto: CreateCertificationDTO, user: any): Promise<any>;
    update(id: string, dto: UpdateCertificationDTO, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
