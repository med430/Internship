// profile.controller.ts
import { Body, Controller, Delete, Patch, Req, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'

import { UpdateStudentProfileDto } from './dto/update-student-profile.dto'
import { UpdateRecruiterProfileDto } from './dto/update-recruiter-profile.dto'
import { UpdateStudentProfileCommand } from '../../../Application/Features/ProfileFeature/Commands/update-student-profile.command'
import { UpdateRecruiterProfileCommand } from '../../../Application/Features/ProfileFeature/Commands/update-recruiter-profile.command'
import { SoftDeleteUserCommand } from '../../../Application/Features/ProfileFeature/Commands/soft-delete-user.command'
import { Role } from '../../../Domain/enums/role.enum'
import {JwtAuthGuard} from "../guards/jwt-auth.guard";

@Controller('me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private commandBus: CommandBus) {}

    @Patch()
    update(@Req() req, @Body() dto: UpdateStudentProfileDto | UpdateRecruiterProfileDto) {
        const userId = req.user.id
        const role   = req.user.role

        if (role === Role.STUDENT) {
            const studentDto = dto as UpdateStudentProfileDto
            return this.commandBus.execute(
                new UpdateStudentProfileCommand(
                    userId,
                    studentDto.name,
                    studentDto.lastname,
                    studentDto.username,
                    studentDto.phone,
                    studentDto.avatarUrl,
                    studentDto.bio,
                    studentDto.birthDate,
                    studentDto.gender,
                    studentDto.address,
                    studentDto.city,
                    studentDto.domains,
                )
            )
        }

        const recruiterDto = dto as UpdateRecruiterProfileDto
        return this.commandBus.execute(
            new UpdateRecruiterProfileCommand(
                userId,
                recruiterDto.name,
                recruiterDto.lastname,
                recruiterDto.username,
                recruiterDto.phone,
                recruiterDto.avatarUrl,
                recruiterDto.company,
                recruiterDto.companyDescription,
                recruiterDto.website,
            )
        )
    }

    @Delete()
    softDelete(@Req() req) {
        return this.commandBus.execute(
            new SoftDeleteUserCommand(req.user.id)
        )
    }
}