// Ingests user behavior events (views, bookmarks, impressions, searches) straight to the repos.

import { BadRequestException, Body, Controller, HttpCode, Inject, Post, UseGuards } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { SupabaseUser } from '../decorators/supabase-user.decorator'
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service'
import { Role } from '../../../Domain/enums/role.enum'
import { TrackEventBatchDto, TrackEventDto } from './dto/track-event.dto'
import { IOfferViewRepository } from '../../../Application/repositories/offer-view.repository'
import { IOfferBookmarkRepository } from '../../../Application/repositories/offer-bookmark.repository'
import { IOfferImpressionRepository } from '../../../Application/repositories/offer-impression.repository'
import { ISearchQueryRepository } from '../../../Application/repositories/search-query.repository'
import { IProfileViewRepository } from '../../../Application/repositories/profile-view.repository'
import { OfferView } from '../../../Domain/entities/offer-view.entity'
import { OfferBookmark } from '../../../Domain/entities/offer-bookmark.entity'
import { OfferImpression } from '../../../Domain/entities/offer-impression.entity'
import { SearchQuery } from '../../../Domain/entities/search-query.entity'
import { ProfileView } from '../../../Domain/entities/profile-view.entity'

@Controller('events')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.STUDENT, Role.RECRUITER)
export class TrackingController {
    constructor(
        @Inject(IOfferViewRepository)        private readonly views:       IOfferViewRepository,
        @Inject(IOfferBookmarkRepository)    private readonly bookmarks:   IOfferBookmarkRepository,
        @Inject(IOfferImpressionRepository)  private readonly impressions: IOfferImpressionRepository,
        @Inject(ISearchQueryRepository)      private readonly searches:    ISearchQueryRepository,
        @Inject(IProfileViewRepository)      private readonly profileViews: IProfileViewRepository,
    ) {}

    // Single-event ingestion. Used for views, bookmarks, search queries, etc. Returns 202 (accepted, not necessarily processed).
    @Post('track')
    @HttpCode(202)
    async track(@SupabaseUser() user: ResolvedUser, @Body() dto: TrackEventDto) {
        await this.handleEvent(user, dto)
        return { ok: true }
    }

    // Batch ingestion for the impression burst that happens on every feed render (one offer per card shown).
    // Impressions get their own fast path via createMany; other events still go one-by-one.
    @Post('track/batch')
    @HttpCode(202)
    async trackBatch(@SupabaseUser() user: ResolvedUser, @Body() dto: TrackEventBatchDto) {
        if (!Array.isArray(dto?.events)) throw new BadRequestException('events must be an array')

        // Impressions get their own fast path (single createMany)
        const impressions: OfferImpression[] = []
        const otherEvents: TrackEventDto[] = []

        for (const evt of dto.events) {
            if (evt.eventType === 'offer_impression' && evt.data?.offerId) {
                impressions.push(new OfferImpression(
                    randomUUID(),
                    user.id,
                    evt.data.offerId,
                    new Date(),
                    evt.data.position,
                ))
            } else {
                otherEvents.push(evt)
            }
        }

        if (impressions.length) await this.impressions.createBatch(impressions)
        for (const evt of otherEvents) await this.handleEvent(user, evt)

        return { ok: true, accepted: dto.events.length }
    }

    // Routes one event to the right repository. studentId/recruiterId always comes from the JWT, never from the body.
    private async handleEvent(user: ResolvedUser, evt: TrackEventDto) {
        const now = new Date()
        switch (evt.eventType) {
            case 'offer_view':
                if (!evt.data?.offerId) throw new BadRequestException('offerId required')
                await this.views.save(new OfferView(
                    typeof evt.data.viewId === 'string' && evt.data.viewId.trim()
                        ? evt.data.viewId.trim()
                        : randomUUID(),
                    user.id,
                    evt.data.offerId,
                    now,
                    evt.data.durationMs,
                    evt.data.source,
                    evt.data.position,
                ))
                return

            case 'offer_bookmark':
                if (!evt.data?.offerId) throw new BadRequestException('offerId required')
                await this.bookmarks.save(new OfferBookmark(
                    randomUUID(), user.id, evt.data.offerId, now,
                ))
                return

            case 'offer_unbookmark':
                if (!evt.data?.offerId) throw new BadRequestException('offerId required')
                await this.bookmarks.softRemove(user.id, evt.data.offerId)
                return

            case 'offer_impression':
                if (!evt.data?.offerId) throw new BadRequestException('offerId required')
                await this.impressions.createBatch([new OfferImpression(
                    randomUUID(), user.id, evt.data.offerId, now, evt.data.position,
                )])
                return

            case 'search_query':
                if (!evt.data?.query) throw new BadRequestException('query required')
                await this.searches.save(new SearchQuery(
                    randomUUID(),
                    user.id,
                    evt.data.query,
                    now,
                    evt.data.filters,
                    evt.data.resultsCount,
                ))
                return

            case 'profile_view':
                if (!evt.data?.studentProfileId) throw new BadRequestException('studentProfileId required')
                if (user.role !== Role.RECRUITER) throw new BadRequestException('only recruiters can record profile views')
                await this.profileViews.save(new ProfileView(
                    randomUUID(),
                    user.id,
                    evt.data.studentProfileId,
                    now,
                    evt.data.offerId,
                ))
                return

            default:
                throw new BadRequestException('unknown eventType')
        }
    }
}
