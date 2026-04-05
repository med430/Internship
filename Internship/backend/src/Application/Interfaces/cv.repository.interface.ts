import { CV } from '../../Domain/entities/cv.entity'
import { IGenericRepository } from './generic.repository.interface'

export interface ICVRepository extends IGenericRepository<CV> {
    findByStudent(studentId: string): Promise<CV[]>
}