import {PayloadDto} from "./dto/payload.dto";
import {Role} from "../../../Domain/enums/role.enum";

export abstract class IAuthService {
    abstract createJwtToken(username: string, role: Role): Promise<string>;
    abstract validateJwtToken(token: string): Promise<PayloadDto>;
}