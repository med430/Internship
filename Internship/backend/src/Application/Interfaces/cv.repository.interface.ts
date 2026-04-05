import { CV } from '../../Domain/entities/cv.entity'
import { IGenericRepository } from './generic.repository.interface'

export abstract class ICVRepository extends IGenericRepository<CV> {
    abstract findByStudent(studentId: string): Promise<CV[]>
}