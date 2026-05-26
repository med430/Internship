// Verifies a Supabase JWT and resolves the matching User row — auto-provisions on first hit.

import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose'
import { IUserRepository } from '../../repositories/user.repository'
import { IStudentProfileRepository } from '../../repositories/student-profile.repository'
import { User } from '../../../Domain/entities/user.entity'
import { StudentProfile } from '../../../Domain/entities/student-profile.entity'
import { Role } from '../../../Domain/enums/role.enum'

interface SupabaseJwtPayload extends JWTPayload {
    sub?: string
    email?: string
    role?: string
    user_metadata?: { role?: string; name?: string; lastname?: string; username?: string }
    app_metadata?:  { role?: string }
}

export interface ResolvedUser {
    id: string
    email: string
    role: Role
    isNew: boolean
}

@Injectable()
export class SupabaseAuthBridge {
    private readonly logger = new Logger(SupabaseAuthBridge.name)
    private readonly jwks: ReturnType<typeof createRemoteJWKSet>
    private readonly issuer: string

    constructor(
        cfg: ConfigService,
        @Inject(IUserRepository)            private readonly users:    IUserRepository,
        @Inject(IStudentProfileRepository)  private readonly profiles: IStudentProfileRepository,
    ) {
        const baseUrl = (cfg.get<string>('NEXT_PUBLIC_SUPABASE_URL') ?? '').replace(/\/$/, '')
        this.issuer = `${baseUrl}/auth/v1`
        this.jwks = createRemoteJWKSet(new URL(`${this.issuer}/.well-known/jwks.json`))
    }

    // Verifies the JWT against Supabase's public keys, finds our User by sub, creates one if missing.
    // Returns null for missing, malformed, expired, or forged tokens.
    async resolve(token: string | null | undefined): Promise<ResolvedUser | null> {
        const payload = await this.verify(token)
        if (!payload?.sub) return null

        const existing = await this.users.findById(payload.sub)
        if (existing) {
            return { id: existing.id, email: existing.email, role: existing.role, isNew: false }
        }

        return this.provision(payload)
    }

    // Performs proper signature verification using ES256 keys served from Supabase's JWKS endpoint.
    private async verify(token: string | null | undefined): Promise<SupabaseJwtPayload | null> {
        if (!token) return null
        try {
            const { payload } = await jwtVerify(token, this.jwks, { issuer: this.issuer })
            return payload as SupabaseJwtPayload
        } catch (err) {
            this.logger.debug(`token rejected: ${(err as Error).message}`)
            return null
        }
    }

    // Creates a User row with id = Supabase sub plus a paired StudentProfile when the role is STUDENT.
    private async provision(payload: SupabaseJwtPayload): Promise<ResolvedUser> {
        const role = this.extractRole(payload)
        const email = payload.email ?? `${payload.sub}@unknown.local`
        const name = payload.user_metadata?.name ?? this.deriveNameFromEmail(email)
        const lastname = payload.user_metadata?.lastname ?? ''
        const username = payload.user_metadata?.username ?? this.deriveUsernameFromEmail(email, payload.sub!)
        const placeholderHash = await bcrypt.hash(`supabase:${payload.sub}`, 4)

        const user = new User(
            payload.sub!,
            email,
            name,
            lastname,
            username,
            placeholderHash,
            role,
        )
        const saved = await this.users.save(user)

        if (role === Role.STUDENT) {
            await this.profiles.save(new StudentProfile(payload.sub!, saved.id))
        }

        this.logger.log(`auto-provisioned ${role} ${email} from Supabase sub ${payload.sub}`)
        return { id: saved.id, email: saved.email, role: saved.role, isNew: true }
    }

    // Reads our app role from app_metadata first (server-set), then user_metadata, defaults to STUDENT.
    private extractRole(payload: SupabaseJwtPayload): Role {
        const raw = (payload.app_metadata?.role ?? payload.user_metadata?.role ?? '').toUpperCase()
        if (raw === 'RECRUITER') return Role.RECRUITER
        if (raw === 'ADMIN')     return Role.ADMIN
        return Role.STUDENT
    }

    // Falls back to the local part of the email when no display name was provided.
    private deriveNameFromEmail(email: string): string {
        return (email.split('@')[0] ?? 'user').slice(0, 60)
    }

    // Username must be globally unique; we append a short slice of the Supabase sub to stay safe.
    private deriveUsernameFromEmail(email: string, sub: string): string {
        const base = (email.split('@')[0] ?? 'user').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24) || 'user'
        const suffix = sub.replace(/-/g, '').slice(0, 6)
        return `${base}_${suffix}`
    }
}
