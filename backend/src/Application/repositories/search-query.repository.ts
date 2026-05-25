import { SearchQuery } from '../../Domain/entities/search-query.entity'
import { IGenericRepository } from './generic.repository'

export abstract class ISearchQueryRepository extends IGenericRepository<SearchQuery> {
    abstract findByStudent(studentId: string, limit?: number): Promise<SearchQuery[]>
    abstract deleteOlderThan(cutoff: Date): Promise<number>
}
