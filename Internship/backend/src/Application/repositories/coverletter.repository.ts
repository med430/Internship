// Application/repositories/cover-letter.repository.ts
import { CoverLetter } from '../../Domain/entities/coverletter.entity'
import { IGenericRepository } from './generic.repository'

export interface ICoverLetterRepository extends IGenericRepository<CoverLetter> {
    findByStudent(studentId: string): Promise<CoverLetter[]>
}

export const ICoverLetterRepository = Symbol('ICoverLetterRepository')