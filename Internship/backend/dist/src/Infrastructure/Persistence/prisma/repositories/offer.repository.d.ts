import { PrismaService } from '../prisma.service';
import { OfferMapper } from '../mappers/offer.mapper';
import { IOfferRepository } from "../../../../Application/repositories/offer.repository";
import { Offer } from "../../../../Domain/entities/offer.entity";
import { GenericRepository } from "./generic.repositories";
export declare class OfferRepositoryImpl extends GenericRepository<Offer, any> implements IOfferRepository {
    protected readonly includeOptions: {
        skillRequirements: {
            include: {
                skill: boolean;
            };
        };
    };
    constructor(prisma: PrismaService, mapper: OfferMapper);
    save(entity: Offer): Promise<Offer>;
    findById(id: string): Promise<Offer | null>;
    findAll(): Promise<Offer[]>;
    findByRecruiter(recruiterId: string): Promise<Offer[]>;
}
