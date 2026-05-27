import { InterviewSlot } from '../../Domain/entities/interview-slot.entity'

export abstract class IInterviewSlotRepository {
    abstract save(slot: InterviewSlot): Promise<InterviewSlot>
    abstract findById(id: string): Promise<InterviewSlot | null>
    abstract update(slot: InterviewSlot): Promise<InterviewSlot>
    abstract findByStudentUserId(userId: string): Promise<InterviewSlot[]>
    abstract findByRecruiterUserId(userId: string): Promise<InterviewSlot[]>
    abstract findByApplicationId(applicationId: string): Promise<InterviewSlot[]>
}