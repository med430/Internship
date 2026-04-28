
import { Experience } from '../../Domain/entities/experience.entity'
import {IGenericRepository} from "./generic.repository";

export abstract class IExperienceRepository
    extends IGenericRepository<Experience> {}