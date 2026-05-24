import { CoverLetter } from '../../Domain/entities/coverletter.entity';
import { IGenericRepository } from './generic.repository';
export interface ICoverLetterRepository extends IGenericRepository<CoverLetter> {
    findByStudent(studentId: string): Promise<CoverLetter[]>;
}
export declare const ICoverLetterRepository: unique symbol;
