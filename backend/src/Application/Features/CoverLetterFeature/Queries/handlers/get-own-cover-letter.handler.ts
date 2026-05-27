import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common'
import { GetOwnCoverLetterQuery } from '../get-own-cover-letter.query'
import { ICoverLetterRepository } from '../../../../repositories/coverletter.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'

@QueryHandler(GetOwnCoverLetterQuery)
export class GetOwnCoverLetterHandler implements IQueryHandler<GetOwnCoverLetterQuery> {

    constructor(
        @Inject(ICoverLetterRepository)
        private readonly letterRepo: ICoverLetterRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
    ) {}

    async execute(query: GetOwnCoverLetterQuery) {
        const profile = await this.studentRepo.findByUserId(query.userId)
        if (!profile) throw new NotFoundException('Profile not found')

        const letter = await this.letterRepo.findById(query.letterId)
        if (!letter || letter.deletedAt) throw new NotFoundException('Cover letter not found')

        if (letter.studentId !== profile.id) throw new ForbiddenException()

        return {
            id: letter.id,
            student_id: letter.studentId,
            file_url: letter.fileUrl,
            created_at: letter.createdAt,
            updated_at: letter.updatedAt,
        }
    }
}
