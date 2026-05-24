import { CV } from '../../Domain/entities/cv.entity';
import { IGenericRepository } from './generic.repository';
export interface ICVRepository extends IGenericRepository<CV> {
    findByStudent(studentId: string): Promise<CV[]>;
}
export declare const ICVRepository: unique symbol;
