import { PrismaService } from '../prisma.service';
import { CertificationMapper } from '../mappers/certification.mapper';
import { ICertificationRepository } from "../../../../Application/repositories/certification.repository";
import { GenericRepository } from "./generic.repositories";
import { Certification } from "../../../../Domain/entities/certification.entity";
export declare class CertificationRepositoryImpl extends GenericRepository<Certification, any> implements ICertificationRepository {
    constructor(prisma: PrismaService, mapper: CertificationMapper);
}
