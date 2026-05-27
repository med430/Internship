import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'

import { GetMyInterviewSlotsQuery } from '../get-my-interview-slots.query'
import { IInterviewSlotRepository } from '../../../../repositories/interview-slot.repository'
import { InterviewSlot } from '../../../../../Domain/entities/interview-slot.entity'

@QueryHandler(GetMyInterviewSlotsQuery)
export class GetMyInterviewSlotsHandler implements IQueryHandler<GetMyInterviewSlotsQuery> {
    constructor(
        @Inject(IInterviewSlotRepository)
        private readonly slotRepo: IInterviewSlotRepository,
    ) {}

    async execute(query: GetMyInterviewSlotsQuery): Promise<InterviewSlot[]> {
        if (query.role === 'RECRUITER') {
            return this.slotRepo.findByRecruiterUserId(query.userId)
        }
        return this.slotRepo.findByStudentUserId(query.userId)
    }
}
