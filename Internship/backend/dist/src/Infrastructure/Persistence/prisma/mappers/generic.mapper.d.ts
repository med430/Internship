export interface IGenericMapper<TDomain, TPersistence> {
    toDomain(raw: TPersistence): TDomain;
    toPersistence(domain: TDomain): any;
}
