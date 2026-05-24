import { Recommendation } from '../../Domain/entities/recommendation.entity';
import { IGenericRepository } from './generic.repository';
export declare abstract class IRecommendationRepository extends IGenericRepository<Recommendation> {
    abstract findByStudent(studentId: string): Promise<Recommendation[]>;
    abstract findByRecruiter(recruiterId: string): Promise<Recommendation[]>;
}
