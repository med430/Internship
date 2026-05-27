// profile.controller.ts
import { BadRequestException, Body, Controller, Delete, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

import { UpdateStudentProfileDto } from './dto/update-student-profile.dto'
import { UpdateRecruiterProfileDto } from './dto/update-recruiter-profile.dto'
import { UpdateStudentProfileCommand } from '../../../Application/Features/ProfileFeature/Commands/update-student-profile.command'
import { UpdateRecruiterProfileCommand } from '../../../Application/Features/ProfileFeature/Commands/update-recruiter-profile.command'
import { UploadAvatarCommand } from '../../../Application/Features/ProfileFeature/Commands/upload-avatar.command'
import { SoftDeleteUserCommand } from '../../../Application/Features/ProfileFeature/Commands/soft-delete-user.command'
import { Role } from '../../../Domain/enums/role.enum'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT, Role.RECRUITER)
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

    @Post('avatar')
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (_, file, cb) => {
                if (!file.mimetype.startsWith('image/'))
                    return cb(new BadRequestException('Only image files allowed'), false)
                cb(null, true)
            },
        })
    )
    uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
        if (!file) throw new BadRequestException('Image file required')
        return this.commandBus.execute(new UploadAvatarCommand(req.user.id, file))
    }

    @Delete()
    softDelete(@Req() req) {
        return this.commandBus.execute(
            new SoftDeleteUserCommand(req.user.id)
        )
    }
}