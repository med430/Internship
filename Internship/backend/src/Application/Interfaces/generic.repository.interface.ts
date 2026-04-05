export interface IGenericRepository<T> {
    findById(id: string): Promise<T | null>
    findAll(): Promise<T[]>
    save(entity: T): Promise<T>
    delete(id: string): Promise<void>
}