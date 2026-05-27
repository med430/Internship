// Verifies a Supabase JWT (ES256) and resolves the matching User row — auto-provisions on first hit.

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { importJWK, jwtVerify, type JWTPayload } from 'jose'
import { IUserRepository } from '../../repositories/user.repository'
import { IStudentProfileRepository } from '../../repositories/student-profile.repository'
import { IRecruiterProfileRepository } from '../../repositories/recruiter-profile.repository'
import { User } from '../../../Domain/entities/user.entity'
import { StudentProfile } from '../../../Domain/entities/student-profile.entity'
import { RecruiterProfile } from '../../../Domain/entities/recruiter-profile.entity'
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
export class SupabaseAuthBridge implements OnModuleInit {
    private readonly logger = new Logger(SupabaseAuthBridge.name)
    private readonly jwksUrl: string
    private publicKey?: CryptoKey

    constructor(
        cfg: ConfigService,
        @Inject(IUserRepository)               private readonly users:      IUserRepository,
        @Inject(IStudentProfileRepository)     private readonly students:   IStudentProfileRepository,
        @Inject(IRecruiterProfileRepository)   private readonly recruiters: IRecruiterProfileRepository,
    ) {
        const supabaseUrl = cfg.get<string>('NEXT_PUBLIC_SUPABASE_URL') ?? ''
        this.jwksUrl = `${supabaseUrl}/auth/v1/.well-known/jwks.json`
    }

    async onModuleInit() {
        try {
            const res = await fetch(this.jwksUrl)
            const { keys } = await res.json() as { keys: JsonWebKey[] }
            if (!keys?.length) throw new Error('JWKS returned no keys')
            this.publicKey = await importJWK(keys[0], 'ES256') as CryptoKey
            this.logger.log('Supabase ES256 public key loaded')
        } catch (err) {
            this.logger.error(`Failed to load Supabase public key: ${(err as Error).message}`)
        }
    }

    async resolve(token: string | null | undefined): Promise<ResolvedUser | null> {
        const payload = await this.verify(token)
        if (!payload?.sub) return null

        const byId    = await this.users.findById(payload.sub)
        let   byEmail = payload.email ? await this.users.findByEmail(payload.email) : null
        if (byEmail?.deletedAt) byEmail = null

        // When the same Supabase account has two NeonDB rows (auto-provisioned STUDENT
        // by sub ID + explicitly registered non-STUDENT by email), prefer the registered one.
        if (byId && byEmail && byId.id !== byEmail.id) {
            return { id: byEmail.id, email: byEmail.email, role: byEmail.role, isNew: false }
        }

        // Single row found — promote role if JWT claims higher than stored, and ensure
        // the matching role profile (RecruiterProfile / StudentProfile) exists.
        const candidate = byId ?? byEmail
        if (candidate) {
            const jwtRole = this.extractRole(payload)
            if (candidate.role === Role.STUDENT && jwtRole !== Role.STUDENT) {
                candidate.role = jwtRole
                await this.users.update(candidate)
                this.logger.log(`promoted ${candidate.email} from STUDENT to ${jwtRole}`)
            }
            // Always ensure the role profile exists — guards against cases where
            // profile creation failed on a previous request or was never triggered.
            await this.ensureRoleProfile(candidate.id, candidate.role)
            return { id: candidate.id, email: candidate.email, role: candidate.role, isNew: false }
        }

        // First-ever login — auto-provision with Supabase sub as ID
        return this.provision(payload)
    }

    private async ensureRoleProfile(userId: string, role: Role): Promise<void> {
        if (role === Role.RECRUITER) {
            const existing = await this.recruiters.findByUserId(userId)
            if (!existing) {
                await this.recruiters.save(new RecruiterProfile(randomUUID(), userId, ''))
            }
        } else if (role === Role.STUDENT) {
            const existing = await this.students.findByUserId(userId)
            if (!existing) {
                await this.students.save(new StudentProfile(randomUUID(), userId))
            }
        }
    }

    private async verify(token: string | null | undefined): Promise<SupabaseJwtPayload | null> {
        if (!token) return null
        if (!this.publicKey) return null

        // Peek at the header without verifying — skip non-ES256 tokens silently
        try {
            const headerJson = Buffer.from(token.split('.')[0], 'base64url').toString('utf8')
            const { alg } = JSON.parse(headerJson) as { alg?: string }
            if (alg !== 'ES256') return null
        } catch {
            return null
        }

        try {
            const { payload } = await jwtVerify(token, this.publicKey)
            return payload as SupabaseJwtPayload
        } catch (err) {
            this.logger.debug(`token rejected: ${(err as Error).message}`)
            return null
        }
    }

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
            await this.students.save(new StudentProfile(payload.sub!, saved.id))
        } else if (role === Role.RECRUITER) {
            await this.recruiters.save(new RecruiterProfile(randomUUID(), saved.id, ''))
        }

        this.logger.log(`auto-provisioned ${role} ${email} from Supabase sub ${payload.sub}`)
        return { id: saved.id, email: saved.email, role: saved.role, isNew: true }
    }

    private extractRole(payload: SupabaseJwtPayload): Role {
        const raw = (payload.app_metadata?.role ?? payload.user_metadata?.role ?? '').toUpperCase()
        if (raw === 'RECRUITER') return Role.RECRUITER
        if (raw === 'ADMIN')     return Role.ADMIN
        return Role.STUDENT
    }

    private deriveNameFromEmail(email: string): string {
        return (email.split('@')[0] ?? 'user').slice(0, 60)
    }

    private deriveUsernameFromEmail(email: string, sub: string): string {
        const base = (email.split('@')[0] ?? 'user').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24) || 'user'
        const suffix = sub.replace(/-/g, '').slice(0, 6)
        return `${base}_${suffix}`
    }
}