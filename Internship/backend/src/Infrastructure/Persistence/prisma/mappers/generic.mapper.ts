export interface IGenericMapper<T, P> {
  toDomain(persistence: P): T;
  toPersistence(domain: T): P;
}
