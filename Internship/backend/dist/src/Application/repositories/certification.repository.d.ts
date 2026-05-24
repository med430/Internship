import { Certification } from '../../Domain/entities/certification.entity';
import { IGenericRepository } from './generic.repository';
export interface ICertificationRepository extends IGenericRepository<Certification> {
}
export declare const ICertificationRepository: unique symbol;
