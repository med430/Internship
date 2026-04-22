export abstract class IGenericRepository<T, ID = string> {

    abstract findById(id: ID): Promise<T | null>

    abstract findAll(): Promise<T[]>

    abstract save(entity: T): Promise<T>

    abstract delete(id: ID): Promise<void>
}