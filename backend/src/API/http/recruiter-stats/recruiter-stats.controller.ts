import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { SupabaseUser } from '../decorators/supabase-user.decorator'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'
import { Role } from '../../../Domain/enums/role.enum'
import { PrismaService } from '../../../Infrastructure/Persistence/prisma/prisma.service'

@Controller('recruiter')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.RECRUITER)
export class RecruiterStatsController {
    constructor(private readonly prisma: PrismaService) {}

    // ── Dashboard KPIs ────────────────────────────────────────────────────
    @Get('stats')
    async getStats(@SupabaseUser() user: ResolvedUser) {
        const rp = await this.prisma.recruiterProfile.findUnique({
            where: { userId: user.id },
        })
        if (!rp) throw new NotFoundException('Recruiter profile not found')

        const oneWeekAgo = new Date(Date.now() - 7 * 86_400_000)

        const [activeOffers, applications] = await Promise.all([
            this.prisma.offer.count({
                where: { recruiterProfileId: rp.id, deletedAt: null },
            }),
            this.prisma.application.findMany({
                where: {
                    offer: { recruiterProfileId: rp.id },
                    deletedAt: null,
                },
                select: { status: true, createdAt: true },
            }),
        ])

        const applicationsThisWeek = applications.filter(
            (a) => a.createdAt >= oneWeekAgo,
        ).length

        const responded = applications.filter((a) =>
            ['ACCEPTED', 'REJECTED'].includes(a.status),
        ).length

        const responseRate =
            applications.length > 0
                ? Math.round((responded / applications.length) * 100)
                : 0

        return {
            activeOffers,
            totalApplications: applications.length,
            applicationsThisWeek,
            responseRate,
            acceptedApplications: applications.filter(
                (a) => a.status === 'ACCEPTED',
            ).length,
            rejectedApplications: applications.filter(
                (a) => a.status === 'REJECTED',
            ).length,
            pendingApplications: applications.filter(
                (a) => a.status === 'SUBMITTED' || a.status === 'IN_REVIEW',
            ).length,
        }
    }

    // ── Per-offer analytics ───────────────────────────────────────────────
    @Get('offer-analytics')
    async getOfferAnalytics(@SupabaseUser() user: ResolvedUser) {
        const rp = await this.prisma.recruiterProfile.findUnique({
            where: { userId: user.id },
        })
        if (!rp) throw new NotFoundException('Recruiter profile not found')

        const offers = await this.prisma.offer.findMany({
            where: { recruiterProfileId: rp.id, deletedAt: null },
            select: {
                id: true,
                title: true,
                type: true,
                createdAt: true,
                _count: {
                    select: {
                        views: true,
                        impressions: true,
                        applications: { where: { deletedAt: null } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        if (offers.length === 0) return []

        const offerIds = offers.map((o) => o.id)
        const appGroups = await this.prisma.application.groupBy({
            by: ['offerId', 'status'],
            where: { offerId: { in: offerIds }, deletedAt: null },
            _count: { _all: true },
        })

        return offers.map((o) => {
            const groups = appGroups.filter((g) => g.offerId === o.id)
            const count = (status: string) =>
                groups.find((g) => g.status === status)?._count._all ?? 0

            return {
                offerId: o.id,
                title: o.title,
                type: o.type,
                viewCount: o._count.views,
                impressionCount: o._count.impressions,
                applicationCount: o._count.applications,
                acceptedCount: count('ACCEPTED'),
                rejectedCount: count('REJECTED'),
                pendingCount: count('SUBMITTED') + count('IN_REVIEW'),
                createdAt: o.createdAt,
            }
        })
    }
}
