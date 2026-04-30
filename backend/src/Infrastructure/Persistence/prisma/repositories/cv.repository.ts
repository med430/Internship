// infrastructure/repositories/cv.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CVMapper } from '../mappers/cv.mapper'
import {GenericRepository} from "./generic.repositories";
import {CV} from "../../../../Domain/entities/cv.entity";
import {ICVRepository} from "../../../../Application/repositories/cv.repository";

@Injectable()
export class CVRepositoryImpl
    extends GenericRepository<CV, any>
    implements ICVRepository {

    constructor(
        prisma: PrismaService,
        mapper: CVMapper
    ) {
        super(prisma, 'cV', mapper)
    }

    async findByStudent(studentId: string): Promise<CV[]> {
        const results = await this.prisma.cV.findMany({
            where: { studentId, deletedAt: null }
        })
        return results.map(r => this.mapper.toDomain(r))
    }
}