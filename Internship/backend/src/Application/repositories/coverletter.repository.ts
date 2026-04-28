// cover-letter.repository.ts
import { IGenericRepository } from './generic.repository'
import {CoverLetter} from "../../Domain/entities/coverletter.entity";
export abstract class ICoverLetterRepository
    extends IGenericRepository<CoverLetter> {

    abstract findByStudent(studentId: string): Promise<CoverLetter[]>
}