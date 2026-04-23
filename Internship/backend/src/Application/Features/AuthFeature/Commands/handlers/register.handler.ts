import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { Inject } from '@nestjs/common'

import { RegisterCommand } from "../register.command"
import { IUserRepository } from "../../../../repositories/user.repository"
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository"
import { IRecruiterProfileRepository } from "../../../../repositories/recruiter-profile.repository"

import { User } from "../../../../../Domain/entities/user.entity"

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {

    constructor(
        @Inject(IUserRepository)
        private userRepo: IUserRepository,

        @Inject(IStudentProfileRepository)
        private studentProfileRepo: IStudentProfileRepository,

        @Inject(IRecruiterProfileRepository)
        private recruiterProfileRepo: IRecruiterProfileRepository
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

        // 🔥 CREATE PROFILE SELON ROLE
        if (command.role === 'RECRUITER') {
            await this.recruiterProfileRepo.create({
                id: randomUUID(),
                userId: savedUser.id
            })
        }

        if (command.role === 'STUDENT') {
            await this.studentProfileRepo.create({
                id: randomUUID(),
                userId: savedUser.id
            })
        }

        return savedUser
    }
}