// Verifies a Supabase JWT and resolves the matching User row — auto-provisions on first hit.

import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import { IUserRepository } from '../../repositories/user.repository'
import { IStudentProfileRepository } from '../../repositories/student-profile.repository'
import { User } from '../../../Domain/entities/user.entity'
import { StudentProfile } from '../../../Domain/entities/student-profile.entity'
import { Role } from '../../../Domain/enums/role.enum'

interface SupabaseJwtPayload extends JWTPayload {
    email?: string
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
    private readonly jwks: ReturnType<typeof createRemoteJWKSet> | null = null
    private readonly symmetricKey: Uint8Array | null = null

    constructor(
        cfg: ConfigService,
        @Inject(IUserRepository)            private readonly users:    IUserRepository,
        @Inject(IStudentProfileRepository)  private readonly profiles: IStudentProfileRepository,
    ) {
        const supabaseUrl = cfg.get<string>('NEXT_PUBLIC_SUPABASE_URL') ?? cfg.get<string>('SUPABASE_URL') ?? ''
        const jwtSecret   = cfg.get<string>('SUPABASE_JWT_SECRET') ?? ''

        if (supabaseUrl) {
            // JWKS works for all algorithms (ES256, RS256, HS256)
            const jwksUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`
            this.jwks = createRemoteJWKSet(new URL(jwksUrl))
            this.logger.log(`Supabase JWKS verification enabled: ${jwksUrl}`)
        } else if (jwtSecret) {
            // Fallback: symmetric HS256 only
            this.symmetricKey = new TextEncoder().encode(jwtSecret)
            this.logger.log('Supabase symmetric JWT verification enabled (HS256)')
        } else {
            this.logger.warn('Neither NEXT_PUBLIC_SUPABASE_URL nor SUPABASE_JWT_SECRET is set — JWT verification will fail')
        }
    }

    // Verifies the JWT using the Supabase JWT secret, finds our User by sub, creates one if missing.
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

    // Verifies the JWT using JWKS (supports ES256/RS256/HS256) or fallback symmetric key.
    private async verify(token: string | null | undefined): Promise<SupabaseJwtPayload | null> {
        if (!token) return null
        try {
            if (this.jwks) {
                const { payload } = await jwtVerify(token, this.jwks)
                return payload as SupabaseJwtPayload
            }
            if (this.symmetricKey) {
                const { payload } = await jwtVerify(token, this.symmetricKey)
                return payload as SupabaseJwtPayload
            }
            return null
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
