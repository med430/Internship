import { Controller, Post, Body } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import {RegisterDTO} from "./dto/register.dto";
import {RegisterCommand} from "../../../Application/Features/AuthFeature/Commands/register.command";
import {LoginDTO} from "./dto/login.dto";
import {LoginCommand} from "../../../Application/Features/AuthFeature/Commands/login.command";

@Controller('auth')
export class AuthController {

    constructor(private commandBus: CommandBus) {}

    @Post('register')
    register(@Body() dto: RegisterDTO) {
        return this.commandBus.execute(
            new RegisterCommand(
                dto.email,
                dto.username,
                dto.password,
                dto.name,
                dto.lastname,
                dto.role
            )
        )
    }

    @Post('login')
    login(@Body() dto: LoginDTO) {
        return this.commandBus.execute(
            new LoginCommand(dto.email, dto.password)
        )
    }
}