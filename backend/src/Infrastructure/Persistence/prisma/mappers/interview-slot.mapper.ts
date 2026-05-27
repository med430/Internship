import { Injectable } from '@nestjs/common'
import { InterviewSlot as PrismaInterviewSlot } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { InterviewSlot } from '../../../../Domain/entities/interview-slot.entity'
import { InterviewSlotStatus } from '../../../../Domain/enums/interview-slot-status.enum'

@Injectable()
export class InterviewSlotMapper implements IGenericMapper<InterviewSlot, PrismaInterviewSlot> {
    toDomain(raw: PrismaInterviewSlot): InterviewSlot {
        return new InterviewSlot(
            raw.id,
            raw.applicationId,
            raw.proposedByUserId,
            raw.startAt,
            raw.endAt,
            raw.status as unknown as InterviewSlotStatus,
            raw.notes ?? null,
            raw.parentSlotId ?? null,
            raw.createdAt,
            raw.updatedAt,
        )
    }

    toPersistence(domain: InterviewSlot) {
        return {
            id:               domain.id,
            applicationId:    domain.applicationId,
            proposedByUserId: domain.proposedByUserId,
            startAt:          domain.startAt,
            endAt:            domain.endAt,
            status:           domain.status,
            notes:            domain.notes ?? null,
            parentSlotId:     domain.parentSlotId ?? null,
        }
    }
}