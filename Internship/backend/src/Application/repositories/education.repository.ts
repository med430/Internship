import {IGenericRepository} from "./generic.repository";
import {Education} from "../../Domain/entities/education.entity";

export abstract class IEducationRepository
    extends IGenericRepository<Education> {}
