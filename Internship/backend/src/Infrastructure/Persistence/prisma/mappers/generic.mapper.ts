// infrastructure/mappers/generic.mapper.ts
export interface IGenericMapper<TDomain, TPersistence> {
  toDomain(raw: TPersistence): TDomain
  toPersistence(domain: TDomain): any
}