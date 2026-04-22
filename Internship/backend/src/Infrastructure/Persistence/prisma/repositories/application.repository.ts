import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { Application } from '../../../../Domain/entities/application.entity'
import { ApplicationStatus } from '../../../../Domain/enums/application-status.enum'
import { Prisma } from '@prisma/client'
import {IApplicationRepository} from "../../../../Application/repositories/application.repository.";

@Injectable()
export class ApplicationRepository implements IApplicationRepository {

    constructor(private prisma: PrismaService) {}

    async findByStudentAndOffer(studentId: string, offerId: string) {

        const res = await this.prisma.application.findUnique({
            where: {
                studentId_offerId: {
                    studentId,
                    offerId
                }
            }
        })

        if (!res) return null

        return new Application(
            res.id,
            res.studentId,
            res.offerId,
            res.status as ApplicationStatus,
            res.cvUrl,
            res.matchScore,
            res.createdAt,
            res.updatedAt,
            res.deletedAt ?? undefined
        )
    }

    async save(app: Application): Promise<Application> {
        try {
            const res = await this.prisma.application.create({
                data: {
                    id: app.id,
                    studentId: app.studentId,
                    offerId: app.offerId,
                    status: app.status,
                    cvUrl: app.cvUrl,
                    matchScore: app.matchScore
                }
            })

            return new Application(
                res.id,
                res.studentId,
                res.offerId,
                res.status as ApplicationStatus,
                res.cvUrl,
                res.matchScore,
                res.createdAt,
                res.updatedAt,
                res.deletedAt ?? undefined
            )

        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw new Error('Already applied to this offer')
                }
            }
            throw e
        }
    }
}