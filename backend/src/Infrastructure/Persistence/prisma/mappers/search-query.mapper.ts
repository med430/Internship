import { Injectable } from '@nestjs/common'
import { Prisma, SearchQuery as PrismaSearchQuery } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { SearchQuery } from '../../../../Domain/entities/search-query.entity'

@Injectable()
export class SearchQueryMapper implements IGenericMapper<SearchQuery, PrismaSearchQuery> {
    toDomain(raw: PrismaSearchQuery): SearchQuery {
        return new SearchQuery(
            raw.id,
            raw.studentId,
            raw.query,
            raw.searchedAt,
            (raw.filters as Record<string, unknown> | null) ?? undefined,
            raw.resultsCount ?? undefined,
        )
    }

    toPersistence(domain: SearchQuery): PrismaSearchQuery {
        return {
            id:           domain.id,
            studentId:    domain.studentId,
            query:        domain.query,
            searchedAt:   domain.searchedAt,
            filters:      (domain.filters ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
            resultsCount: domain.resultsCount ?? null,
        } as PrismaSearchQuery
    }
}
