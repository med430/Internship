import {Body, Controller, Post} from "@nestjs/common";
import {CommandBus} from "@nestjs/cqrs";
import {RegisterCommand} from "../../../Application/Features/AuthFeature/Commands/register.command";
import {LoginCommand} from "../../../Application/Features/AuthFeature/Commands/login.command";
import {RegisterDTO} from "./dto/register.dto";
import {LoginDTO} from "./dto/login.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus
    ) {
    }

    @Post('/register')
    async register(@Body() body: RegisterDTO) {
        return this.commandBus.execute(
            new RegisterCommand(body.name, body.lastname, body.username, body.email, body.password, body.role)
        );
    }

    @Post('/login')
    async login(@Body() body: LoginDTO) {
        return this.commandBus.execute(
            new LoginCommand(body.email, body.password)
        );
    }
}