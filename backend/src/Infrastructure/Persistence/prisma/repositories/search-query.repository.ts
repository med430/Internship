import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { SearchQueryMapper } from '../mappers/search-query.mapper'
import { ISearchQueryRepository } from '../../../../Application/repositories/search-query.repository'
import { SearchQuery } from '../../../../Domain/entities/search-query.entity'
import { GenericRepository } from './generic.repositories'

@Injectable()
export class SearchQueryRepositoryImpl
    extends GenericRepository<SearchQuery, any>
    implements ISearchQueryRepository {

    constructor(prisma: PrismaService, mapper: SearchQueryMapper) {
        super(prisma, 'searchQuery', mapper)
    }

    async save(entity: SearchQuery): Promise<SearchQuery> {
        const result = await this.prisma.searchQuery.create({
            data: {
                id:           entity.id,
                studentId:    entity.studentId,
                query:        entity.query,
                searchedAt:   entity.searchedAt,
                filters:      (entity.filters ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
                resultsCount: entity.resultsCount ?? null,
            },
        })
        return this.mapper.toDomain(result)
    }

    async findByStudent(studentId: string, limit = 100): Promise<SearchQuery[]> {
        const rows = await this.prisma.searchQuery.findMany({
            where: { studentId },
            orderBy: { searchedAt: 'desc' },
            take: limit,
        })
        return rows.map(r => this.mapper.toDomain(r))
    }

    async deleteOlderThan(cutoff: Date): Promise<number> {
        const result = await this.prisma.searchQuery.deleteMany({
            where: { searchedAt: { lt: cutoff } },
        })
        return result.count
    }
}
