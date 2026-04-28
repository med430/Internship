import { IGenericRepository } from '../../../../Application/repositories/generic.repository';
import { IGenericMapper } from '../mappers/generic.mapper';
import { PrismaService } from '../prisma.service';
export abstract class GenericRepository<T, P, ID = string>
    implements IGenericRepository<T, ID> {

  protected readonly includeOptions: object = {}

  constructor(
      protected readonly prisma: PrismaService,
      private readonly modelName: keyof PrismaService,
      protected readonly mapper: IGenericMapper<T, P>,
  ) {}

  private get include() {
    return Object.keys(this.includeOptions).length ? this.includeOptions : undefined
  }

  async findById(id: ID): Promise<T | null> {
    const result = await (this.prisma[this.modelName] as any).findUnique({
      where: { id },
      include: this.include,
    })
    return result ? this.mapper.toDomain(result) : null
  }

  async findAll(): Promise<T[]> {
    const results = await (this.prisma[this.modelName] as any).findMany({
      include: this.include,
    })
    return results.map((r: P) => this.mapper.toDomain(r))
  }

  async findPaginated(pageNumber: number, pageSize: number): Promise<T[]> {
    const skip = (pageNumber - 1) * pageSize
    const results = await (this.prisma[this.modelName] as any).findMany({
      skip,
      take: pageSize,
      include: this.include,
    })
    return results.map((r: P) => this.mapper.toDomain(r))
  }

  async save(entity: T): Promise<T> {
    const persistence = this.mapper.toPersistence(entity)
    const { id, ...data } = persistence as any

    const existing = await (this.prisma[this.modelName] as any).findUnique({
      where: { id }
    })

    const result = existing
        ? await (this.prisma[this.modelName] as any).update({
          where:   { id },
          data,
          include: this.include,
        })
        : await (this.prisma[this.modelName] as any).create({
          data: { id, ...data },
          include: this.include,
        })

    return this.mapper.toDomain(result)
  }

  async delete(id: ID): Promise<void> {
    await (this.prisma[this.modelName] as any).delete({
      where: { id },
    })
  }
}