import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { ListOwnCoverLettersQuery } from '../list-own-cover-letters.query'
import { ICoverLetterRepository } from '../../../../repositories/coverletter.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'

@QueryHandler(ListOwnCoverLettersQuery)
export class ListOwnCoverLettersHandler implements IQueryHandler<ListOwnCoverLettersQuery> {

    constructor(
        @Inject(ICoverLetterRepository)
        private readonly letterRepo: ICoverLetterRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
    ) {}

    async execute(query: ListOwnCoverLettersQuery) {
        const profile = await this.studentRepo.findByUserId(query.userId)
        if (!profile) throw new NotFoundException('Profile not found')

        const all = await this.letterRepo.findByStudent(profile.id)
        const total = all.length
        const totalPages = Math.max(1, Math.ceil(total / query.pageSize))
        const start = (query.page - 1) * query.pageSize
        const letters = all.slice(start, start + query.pageSize)

        return {
            letters: letters.map(l => ({
                id: l.id,
                student_id: l.studentId,
                file_url: l.fileUrl,
                created_at: l.createdAt,
                updated_at: l.updatedAt,
            })),
            total,
            page: query.page,
            pageSize: query.pageSize,
            totalPages,
        }
    }
}
