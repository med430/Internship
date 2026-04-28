// Application/repositories/cv.repository.ts
import { CV } from '../../Domain/entities/cv.entity'
import { IGenericRepository } from './generic.repository'

export interface ICVRepository extends IGenericRepository<CV> {
    findByStudent(studentId: string): Promise<CV[]>
}

export const ICVRepository = Symbol('ICVRepository')