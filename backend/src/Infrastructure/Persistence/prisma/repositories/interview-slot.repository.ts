import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { InterviewSlotMapper } from '../mappers/interview-slot.mapper'
import { IInterviewSlotRepository } from '../../../../Application/repositories/interview-slot.repository'
import { InterviewSlot } from '../../../../Domain/entities/interview-slot.entity'

@Injectable()
export class InterviewSlotRepositoryImpl implements IInterviewSlotRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: InterviewSlotMapper,
    ) {}

    async save(slot: InterviewSlot): Promise<InterviewSlot> {
        const data = this.mapper.toPersistence(slot)
        const raw = await this.prisma.interviewSlot.create({ data })
        return this.mapper.toDomain(raw)
    }

    async findById(id: string): Promise<InterviewSlot | null> {
        const raw = await this.prisma.interviewSlot.findUnique({ where: { id } })
        return raw ? this.mapper.toDomain(raw) : null
    }

    async update(slot: InterviewSlot): Promise<InterviewSlot> {
        const raw = await this.prisma.interviewSlot.update({
            where: { id: slot.id },
            data: { status: slot.status },
        })
        return this.mapper.toDomain(raw)
    }

    async findByApplicationId(applicationId: string): Promise<InterviewSlot[]> {
        const results = await this.prisma.interviewSlot.findMany({
            where: { applicationId },
            orderBy: { createdAt: 'desc' },
        })
        return results.map(r => this.mapper.toDomain(r))
    }

    async findByStudentUserId(userId: string): Promise<InterviewSlot[]> {
        const results = await this.prisma.interviewSlot.findMany({
            where: { application: { student: { userId } } },
            include: {
                application: {
                    include: {
                        offer: {
                            select: {
                                title: true,
                                company: true,
                                recruiterProfile: {
                                    select: { user: { select: { name: true } } },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { startAt: 'asc' },
        })
        return results.map(r => this.mapper.toDomain(r))
    }

    async findByRecruiterUserId(userId: string): Promise<InterviewSlot[]> {
        const results = await this.prisma.interviewSlot.findMany({
            where: { application: { offer: { recruiterProfile: { userId } } } },
            include: {
                application: {
                    include: {
                        offer: {
                            select: {
                                title: true,
                                company: true,
                                recruiterProfile: { select: { user: { select: { name: true, email: true } } } },
                            },
                        },
                        student: { include: { user: { select: { name: true, email: true } } } },
                    },
                },
            },
            orderBy: { startAt: 'asc' },
        })
        return results.map(r => this.mapper.toDomain(r))
    }

    async findConfirmedInWindow(from: Date, to: Date): Promise<InterviewSlot[]> {
        const results = await this.prisma.interviewSlot.findMany({
            where: { status: 'CONFIRMED', startAt: { gte: from, lt: to } },
            include: {
                application: {
                    include: {
                        offer: {
                            select: {
                                title: true,
                                company: true,
                                recruiterProfile: { select: { user: { select: { name: true, email: true } } } },
                            },
                        },
                        student: { include: { user: { select: { name: true, email: true } } } },
                    },
                },
            },
        })
        return results.map(r => this.mapper.toDomain(r))
    }
}