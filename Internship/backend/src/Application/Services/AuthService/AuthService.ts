import {IAuthService} from "./IAuthService";
import {PayloadDto} from "./dto/payload.dto";
import {Role} from "../../../Domain/enums/role.enum";
import {JwtService} from "@nestjs/jwt";
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        private readonly jwtService: JwtService
    ) {}

    async createJwtToken(username: string, role: Role): Promise<string> {
        const payload = {
            username,
            role
        };

        return this.jwtService.signAsync(payload);
    }

    async validateJwtToken(token: string): Promise<PayloadDto> {
        return await this.jwtService.verifyAsync<PayloadDto>(token);
    }
}