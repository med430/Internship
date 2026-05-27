// infrastructure/repositories/application.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ApplicationMapper } from '../mappers/application.mapper'
import {GenericRepository} from "./generic.repositories";
import {Application} from "../../../../Domain/entities/application.entity";
import {IApplicationRepository} from "../../../../Application/repositories/application.repository";
import {ApplicationStatus} from "../../../../Domain/enums/application-status.enum";


@Injectable()
export class ApplicationRepositoryImpl
    extends GenericRepository<Application, any>
    implements IApplicationRepository {

    constructor(
        prisma: PrismaService,
        mapper: ApplicationMapper
    ) {
        super(prisma, 'application', mapper)
    }

    async findByStudentAndOffer(studentId: string, offerId: string): Promise<Application | null> {
        const result = await this.prisma.application.findUnique({
            where: { studentId_offerId: { studentId, offerId } }
        })
        return result ? this.mapper.toDomain(result) : null
    }

    async findByStudent(studentId: string): Promise<Application[]> {
        const results = await this.prisma.application.findMany({
            where: { studentId, deletedAt: null }
        })
        return results.map(r => this.mapper.toDomain(r))
    }

    async findByOffer(offerId: string): Promise<Application[]> {
        const results = await this.prisma.application.findMany({
            where: { offerId, deletedAt: null }
        })
        return results.map(r => this.mapper.toDomain(r))
    }

    async rejectAllExcept(offerId: string, acceptedId: string): Promise<void> {
        await this.prisma.application.updateMany({
            where: {
                offerId,
                id: { not: acceptedId },
                deletedAt: null
            },
            data: { status: ApplicationStatus.REJECTED }
        })
    }

    async existsByCvId(cvId: string): Promise<boolean> {
        const count = await this.prisma.application.count({
            where: { cvId, deletedAt: null }  // ← cvUrl devient cvId
        })
        return count > 0
    }

    async existsByCoverLetterId(coverLetterId: string): Promise<boolean> {
        const count = await this.prisma.application.count({
            where: { coverLetterId, deletedAt: null }
        })
        return count > 0
    }

    async findByStudentUserId(userId: string): Promise<Application[]> {
        const results = await this.prisma.application.findMany({
            where: { student: { userId }, deletedAt: null }
        })
        return results.map(r => this.mapper.toDomain(r))
    }

    async findByRecruiterUserId(userId: string): Promise<Application[]> {
        const results = await this.prisma.application.findMany({
            where: { offer: { recruiterProfile: { userId } }, deletedAt: null }
        })
        return results.map(r => this.mapper.toDomain(r))
    }
}