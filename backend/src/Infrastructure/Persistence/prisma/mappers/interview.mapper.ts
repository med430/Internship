import { Injectable } from '@nestjs/common'
import { Interview as PrismaInterview, Prisma } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { Interview, InterviewData } from '../../../../Domain/entities/interview.entity'
import { InterviewStatus } from '../../../../Domain/enums/interview-status.enum'
import { RecruiterMode } from '../../../../Domain/enums/recruiter-mode.enum'

@Injectable()
export class InterviewMapper implements IGenericMapper<Interview, PrismaInterview> {
    toDomain(raw: PrismaInterview): Interview {
        return new Interview(
            raw.id,
            raw.studentId,
            raw.offerId ?? undefined,
            raw.company ?? undefined,
            raw.jobTitle ?? undefined,
            raw.jobDescription ?? undefined,
            raw.recruiterMode as unknown as RecruiterMode,
            raw.status as unknown as InterviewStatus,
            raw.score ?? 0,
            raw.feedback ?? '',
            raw.summary ?? undefined,
            (raw.data as unknown as InterviewData) ?? undefined,
            raw.createdAt,
            raw.updatedAt,
            raw.deletedAt ?? undefined,
        )
    }

    toPersistence(domain: Interview) {
        const data = domain.data as Prisma.JsonValue | undefined

        return {
            id:             domain.id,
            studentId:      domain.studentId,
            offerId:        domain.offerId ?? null,
            company:        domain.company ?? null,
            jobTitle:       domain.jobTitle ?? null,
            jobDescription: domain.jobDescription ?? null,
            recruiterMode:  domain.recruiterMode,
            status:         domain.status,
            score:          domain.score ?? 0,
            feedback:       domain.feedback ?? '',
            summary:        domain.summary ?? null,
            data:           data ?? null,
            deletedAt:      domain.deletedAt ?? null,
        }
    }
}
