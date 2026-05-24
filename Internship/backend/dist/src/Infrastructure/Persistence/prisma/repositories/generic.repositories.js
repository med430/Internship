"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRepository = void 0;
class GenericRepository {
    prisma;
    modelName;
    mapper;
    includeOptions = {};
    constructor(prisma, modelName, mapper) {
        this.prisma = prisma;
        this.modelName = modelName;
        this.mapper = mapper;
    }
    get include() {
        return Object.keys(this.includeOptions).length ? this.includeOptions : undefined;
    }
    async findById(id) {
        const result = await this.prisma[this.modelName].findUnique({
            where: { id },
            include: this.include,
        });
        return result ? this.mapper.toDomain(result) : null;
    }
    async findAll() {
        const results = await this.prisma[this.modelName].findMany({
            include: this.include,
        });
        return results.map((r) => this.mapper.toDomain(r));
    }
    async findPaginated(pageNumber, pageSize) {
        const skip = (pageNumber - 1) * pageSize;
        const results = await this.prisma[this.modelName].findMany({
            skip,
            take: pageSize,
            include: this.include,
        });
        return results.map((r) => this.mapper.toDomain(r));
    }
    async save(entity) {
        const persistence = this.mapper.toPersistence(entity);
        const { id, ...data } = persistence;
        const existing = await this.prisma[this.modelName].findUnique({
            where: { id }
        });
        const result = existing
            ? await this.prisma[this.modelName].update({
                where: { id },
                data,
                include: this.include,
            })
            : await this.prisma[this.modelName].create({
                data: { id, ...data },
                include: this.include,
            });
        return this.mapper.toDomain(result);
    }
    async delete(id) {
        await this.prisma[this.modelName].delete({
            where: { id },
        });
    }
}
exports.GenericRepository = GenericRepository;
//# sourceMappingURL=generic.repositories.js.map