import {ObjectLiteral, Repository} from "typeorm";

export class GenericRepository<T extends ObjectLiteral> {
    constructor(
        protected readonly repository: Repository<T>
    ) {
    }

    async save(entity: T): Promise<T> {
        return this.repository.save(entity);
    }

    async findOne(options: any): Promise<T | null> {
        return this.repository.findOne(options)
    }

    async findById(id: string): Promise<T | null> {
        return this.repository.findOne({ where: { id } as any });
    }

    async findAll(options: any): Promise<T[]> {
        return this.repository.find();
    }
}