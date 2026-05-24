import { PrismaService } from '../prisma.service';
import { RecruiterProfileMapper } from '../mappers/recruiter-profile.mapper';
import { IRecruiterProfileRepository } from '../../../../Application/repositories/recruiter-profile.repository';
import { RecruiterProfile } from '../../../../Domain/entities/recruiter-profile.entity';
import { GenericRepository } from "./generic.repositories";
export declare class RecruiterProfileRepositoryImpl extends GenericRepository<RecruiterProfile, any> implements IRecruiterProfileRepository {
    protected readonly includeOptions: {
        offers: {
            include: {
                skillRequirements: {
                    include: {
                        skill: boolean;
                    };
                };
            };
        };
    };
    constructor(prisma: PrismaService, mapper: RecruiterProfileMapper);
    findById(id: string): Promise<RecruiterProfile | null>;
    findByUserId(userId: string): Promise<RecruiterProfile | null>;
    update(profile: RecruiterProfile): Promise<RecruiterProfile>;
}
