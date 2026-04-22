import { IGenericRepository } from '../../../../Application/repositories/generic.repository';
import { IGenericMapper } from '../mappers/generic.mapper';
import { PrismaService } from '../prisma.service';
export abstract class GenericRepository<
    T,
    P,
    ID = string
> implements IGenericRepository<T, ID> {

  constructor(
      protected readonly prisma: PrismaService,
      private readonly modelName: keyof PrismaService,
      protected readonly mapper: IGenericMapper<T, P>,
  ) {}

  async findById(id: ID): Promise<T | null> {
    const result = await (this.prisma[this.modelName] as any).findUnique({
      where: { id },
    })
    return result ? this.mapper.toDomain(result) : null
  }

  async findAll(): Promise<T[]> {
    const results = await (this.prisma[this.modelName] as any).findMany()
    return results.map((r: P) => this.mapper.toDomain(r))
  }

  async save(entity: T): Promise<T> {
    const persistence = this.mapper.toPersistence(entity)
    const result = await (this.prisma[this.modelName] as any).create({
      data: persistence,
    })
    return this.mapper.toDomain(result)
  }

  async delete(id: ID): Promise<void> {
    await (this.prisma[this.modelName] as any).delete({
      where: { id },
    })
  }
}