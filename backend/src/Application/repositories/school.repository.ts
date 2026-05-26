import { School } from '../../Domain/entities/school.entity'
import { IGenericRepository } from './generic.repository'

export abstract class ISchoolRepository extends IGenericRepository<School, number> {
    abstract findByName(name: string): Promise<School | null>
}
