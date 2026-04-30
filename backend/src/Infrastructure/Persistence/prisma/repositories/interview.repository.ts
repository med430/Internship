import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { InterviewMapper } from '../mappers/interview.mapper'
import { IInterviewRepository } from '../../../../Application/repositories/interview.repository'
import { Interview } from '../../../../Domain/entities/interview.entity'
import { GenericRepository } from './generic.repositories'

@Injectable()
export class InterviewRepositoryImpl
    extends GenericRepository<Interview, any>
    implements IInterviewRepository {

    constructor(prisma: PrismaService, mapper: InterviewMapper) {
        super(prisma, 'interview', mapper)
    }

    async findByStudent(studentId: string): Promise<Interview[]> {
        const results = await this.prisma.interview.findMany({
            where: { studentId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        })
        return results.map(r => this.mapper.toDomain(r))
    }

    async findByOffer(offerId: string): Promise<Interview[]> {
        const results = await this.prisma.interview.findMany({
            where: { offerId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        })
        return results.map(r => this.mapper.toDomain(r))
    }
}
