import {IGenericRepository} from "./generic.repository";
import {Certification} from "../../Domain/entities/certification.entity";

export abstract class ICertificationRepository
    extends IGenericRepository<Certification> {}