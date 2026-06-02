// Student-facing certification CRUD for the current student. Mirrors /me/skills; dispatches the same commands the /certifications controller uses.

import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { SupabaseUser } from '../decorators/supabase-user.decorator'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'
import { CreateCertificationDTO } from '../certification/dto/create-certification.dto'
import { UpdateCertificationDTO } from '../certification/dto/update-certification.dto'
import { CreateCertificationCommand } from '../../../Application/Features/CertificationFeature/Commands/create-certification.command'
import { UpdateCertificationCommand } from '../../../Application/Features/CertificationFeature/Commands/update-certification.command'
import { DeleteCertificationCommand } from '../../../Application/Features/CertificationFeature/Commands/delete-certification.command'

@Controller('me/certifications')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class MeCertificationsController {

    constructor(private readonly bus: CommandBus) {}

    @Post()
    create(@SupabaseUser() user: ResolvedUser, @Body() dto: CreateCertificationDTO) {
        return this.bus.execute(new CreateCertificationCommand(
            user.id, dto.name, dto.organization, dto.issueDate, dto.expirationDate, dto.credentialId, dto.credentialUrl,
        ))
    }

    @Patch(':id')
    update(@SupabaseUser() user: ResolvedUser, @Param('id') id: string, @Body() dto: UpdateCertificationDTO) {
        return this.bus.execute(new UpdateCertificationCommand(
            user.id, id, dto.name, dto.organization, dto.issueDate, dto.expirationDate, dto.credentialId, dto.credentialUrl,
        ))
    }

    @Delete(':id')
    remove(@SupabaseUser() user: ResolvedUser, @Param('id') id: string) {
        return this.bus.execute(new DeleteCertificationCommand(user.id, id))
    }
}
