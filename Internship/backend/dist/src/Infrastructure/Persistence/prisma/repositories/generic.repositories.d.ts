import { IGenericRepository } from '../../../../Application/repositories/generic.repository';
import { IGenericMapper } from '../mappers/generic.mapper';
import { PrismaService } from '../prisma.service';
export declare abstract class GenericRepository<T, P, ID = string> implements IGenericRepository<T, ID> {
    protected readonly prisma: PrismaService;
    private readonly modelName;
    protected readonly mapper: IGenericMapper<T, P>;
    protected readonly includeOptions: object;
    constructor(prisma: PrismaService, modelName: keyof PrismaService, mapper: IGenericMapper<T, P>);
    private get include();
    findById(id: ID): Promise<T | null>;
    findAll(): Promise<T[]>;
    findPaginated(pageNumber: number, pageSize: number): Promise<T[]>;
    save(entity: T): Promise<T>;
    delete(id: ID): Promise<void>;
}
