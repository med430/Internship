// Tiny reference-data endpoints the profile UI needs to populate dropdowns (skills, schools, domains).

import { Controller, Get, Inject, UseGuards } from '@nestjs/common'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { ISkillRepository } from '../../../Application/repositories/skill.repository'
import { ISchoolRepository } from '../../../Application/repositories/school.repository'
import { CAREER_DOMAINS } from '../../../Domain/constants/domains'

@Controller()
@UseGuards(SupabaseAuthGuard)
export class ReferenceController {

    constructor(
        @Inject(ISkillRepository)  private readonly skills:  ISkillRepository,
        @Inject(ISchoolRepository) private readonly schools: ISchoolRepository,
    ) {}

    @Get('skills')
    async listSkills() {
        const all = await this.skills.findAll()
        return all.map(s => ({ id: s.id, name: s.name }))
    }

    @Get('schools')
    async listSchools() {
        const all = await this.schools.findAll()
        return all.map(s => ({ id: s.id, name: s.name, city: s.city }))
    }

    // Canonical list the team already uses for career domains — kept here so the frontend can render the same options.
    @Get('domains')
    listDomains() {
        return [...CAREER_DOMAINS]
    }
}
