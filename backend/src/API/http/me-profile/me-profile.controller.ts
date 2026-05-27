// Student-facing profile + skill endpoints behind Supabase auth. The frontend uses these to drive the recommendation engine.

import {
    Body,
    Controller,
    Get,
    Inject,
    NotFoundException,
    Patch,
    UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../../../Domain/enums/role.enum'
import { SupabaseUser } from '../decorators/supabase-user.decorator'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'
import { IStudentProfileRepository } from '../../../Application/repositories/student-profile.repository'
import { UpdateStudentProfileCommand } from '../../../Application/Features/ProfileFeature/Commands/update-student-profile.command'
import { Gender } from '../../../Domain/enums/gender'
import { UpdateMeProfileDto } from './dto/update-me-profile.dto'

@Controller('me/profile')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class MeProfileController {

    constructor(
        private readonly commandBus: CommandBus,
        @Inject(IStudentProfileRepository) private readonly studentRepo: IStudentProfileRepository,
    ) {}

    // Returns the current student's profile with all matching-relevant fields and their skill list.
    @Get()
    async getProfile(@SupabaseUser() user: ResolvedUser) {
        const profile = await this.studentRepo.findByUserId(user.id)
        if (!profile) throw new NotFoundException('Student profile not found')

        return {
            id: profile.id,
            userId: profile.userId,
            bio: profile.bio ?? null,
            birthDate: profile.birthDate?.toISOString() ?? null,
            gender: profile.gender ?? null,
            address: profile.address ?? null,
            city: profile.city ?? null,
            domains: profile.domains ?? [],
            schoolId: profile.schoolId ?? null,
            currentYear: profile.currentYear ?? null,
            currentProgram: profile.currentProgram ?? null,
            preferredCities: profile.preferredCities ?? [],
            preferredDomains: profile.preferredDomains ?? [],
            preferredOfferTypes: profile.preferredOfferTypes ?? [],
            preferredWorkMode: profile.preferredWorkMode ?? null,
            languages: profile.languages ?? [],
            paidOnly: profile.paidOnly ?? false,
            availableFrom: profile.availableFrom?.toISOString() ?? null,
            availableTo: profile.availableTo?.toISOString() ?? null,
            
            skills: (profile.skills ?? []).map(sa => ({
                id: sa.id,
                skillId: sa.skillId,
                level: sa.level,
            })),
        }
    }

    // Partial update — every field optional. `null` clears optional scalar fields, `undefined` leaves them alone.
    @Patch()
    async update(@SupabaseUser() user: ResolvedUser, @Body() dto: UpdateMeProfileDto) {
        await this.commandBus.execute(new UpdateStudentProfileCommand(
            user.id,
            dto.name,
            dto.lastname,
            dto.username,
            dto.phone,
            dto.avatarUrl,
            dto.bio,
            dto.birthDate ? new Date(dto.birthDate) : undefined,
            dto.gender as Gender | undefined,
            dto.address,
            dto.city,
            dto.domains,
            dto.schoolId,
            dto.currentYear,
            dto.currentProgram,
            dto.preferredCities,
            dto.preferredDomains,
            dto.preferredOfferTypes,
            dto.preferredWorkMode,
            dto.languages,
            dto.paidOnly,
            this.parseNullableDate(dto.availableFrom),
            this.parseNullableDate(dto.availableTo),
        ))
        return this.getProfile(user)
    }

    // Maps ISO string -> Date, passes null through (clear), undefined through (leave alone).
    private parseNullableDate(value: string | null | undefined): Date | null | undefined {
        if (value === undefined) return undefined
        if (value === null) return null
        return new Date(value)
    }
}
