// infrastructure/repositories/certification.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CertificationMapper } from '../mappers/certification.mapper'
import {ICertificationRepository} from "../../../../Application/repositories/certification.repository";
import {GenericRepository} from "./generic.repositories";
import {Certification} from "../../../../Domain/entities/certification.entity";

@Injectable()
export class CertificationRepositoryImpl
    extends GenericRepository<Certification, any>
    implements ICertificationRepository {

    constructor(prisma: PrismaService, mapper: CertificationMapper) {
        super(prisma, 'certification', mapper)
    }

    // current student's certifications, excluding soft-deleted
    async findByStudentProfileId(studentProfileId: string): Promise<Certification[]> {
        const rows = await (this.prisma as any).certification.findMany({
            where: { studentProfileId, deletedAt: null },
            orderBy: { createdAt: 'asc' },
        })
        return rows.map((r: any) => this.mapper.toDomain(r))
    }
}