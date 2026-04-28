// cv.repository.ts
import { IGenericRepository } from './generic.repository'
import {CV} from "../../Domain/entities/cv.entity";

export abstract class ICVRepository extends IGenericRepository<CV> {
    abstract findByStudent(studentId: string): Promise<CV[]>
}