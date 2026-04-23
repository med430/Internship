import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import {RegisterCommand} from "../register.command";
import {IUserRepository} from "../../../../repositories/user.repository";
import {User} from "../../../../../Domain/entities/user.entity";
import {Inject} from "@nestjs/common";
import {RegisterResponseDTO} from "../../../../../API/http/auth/dto/register-response.dto";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {

    constructor(
        @Inject(IUserRepository)
        private userRepo: IUserRepository
    ) {}

    async execute(command: RegisterCommand) {

        const hashedPassword = await bcrypt.hash(command.password, 10)

        const user = new User(
            randomUUID(),
            command.email,
            command.name,
            command.lastname,
            command.username,
            hashedPassword,
            command.role
        )

        const savedUser = await this.userRepo.save(user)

        return new RegisterResponseDTO(
            savedUser.id,
            savedUser.email,
            savedUser.username,
            savedUser.name,
            savedUser.lastname,
            savedUser.role
        )
    }
}