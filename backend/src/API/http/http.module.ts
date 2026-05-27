import {Module} from "@nestjs/common";
import {ApplicationModule} from "../../Application/Application.module";
import { PersistenceModule } from "../../Infrastructure/Persistence/persistence.module";
import {AuthController} from "./auth/auth.controller";
import {OfferController} from "./offer/offer.controller";
import {ApplicationController} from "./application/application.controller";
import {EducationController} from "./education/education.controller";
import {ProjectController} from "./project/project.controller";
import {CertificationController} from "./certification/certification.controller";
import {CoverLetterController} from "./coverLetter/cover-letter.controller";
import {CVController} from "./cv/cv.controller";
import {ExperienceController} from "./experience/experience.controller";
import {ProfileController} from "./profile/profile.controller";
import {SkillAssignmentController} from "./skillAssignment/skill.controller";
import { InterviewController } from "./interview/interview.controller";
import { OnboardController } from "./onboard/onboard.controller";
import { OnboardService } from "./onboard/onboard.service";
import { SseController } from "./sse/sse.controller";
import { SseService } from "./sse/sse.service";
import { SseAuthGuard } from "./sse/sse-auth.guard";
import { TrackingController } from "./tracking/tracking.controller";
import { AdminRecommendationsController } from "./admin/admin-recommendations.controller";
import { AdminController } from "./admin/admin.controller";
import { ChatController } from "./chat/chat.controller";
import { MeController } from "./auth-me/me.controller";
import { MeProfileController } from "./me-profile/me-profile.controller";
import { MeSkillsController } from "./me-profile/me-skills.controller";
import { ReferenceController } from "./reference/reference.controller";
import { NotificationController } from "./notifications/notification.controller";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { SupabaseSyncMiddleware } from "./middleware/supabase-sync.middleware";
import { ApplicationStatusChangedHandler } from "../../Application/Features/ApplicationFeature/Events/handlers/application-status-changed.handler";
import { ApplicationSubmittedHandler } from "../../Application/Features/ApplicationFeature/Events/handlers/application-submitted.handler";
import { ApplicationWithdrawnHandler } from "../../Application/Features/ApplicationFeature/Events/handlers/application-withdrawn.handler";
import { OfferCreatedHandler } from "../../Application/Features/OfferFeature/Events/handlers/offer-created.handler";
import { OfferDeletedHandler } from "../../Application/Features/OfferFeature/Events/handlers/offer-deleted.handler";
import { InterviewSlotController } from "./interview-slot/interview-slot.controller";
import { InterviewSlotProposedHandler } from "../../Application/Features/InterviewSlotFeature/Events/handlers/interview-slot-proposed.handler";
import { InterviewSlotRespondedHandler } from "../../Application/Features/InterviewSlotFeature/Events/handlers/interview-slot-responded.handler";

// Local dev guard: skip ChatController when CHAT_DB_URL is unset (no MongoDB available).
const chatEnabled = !!process.env.CHAT_DB_URL;

@Module({
    imports: [ApplicationModule, PersistenceModule],
    controllers: [AuthController, OfferController, ApplicationController,
        EducationController,
        ProjectController,
        CertificationController,
        CoverLetterController,
        CVController,
        ExperienceController,
        ProfileController,
        SkillAssignmentController,
        InterviewController,
        OnboardController,
        SseController,
        TrackingController,
        AdminRecommendationsController,
        AdminController,
        MeController,
        MeProfileController,
        MeSkillsController,
        ReferenceController,
        NotificationController,
        InterviewSlotController,
        ...(chatEnabled ? [ChatController] : [])],
    providers: [OnboardService, SseService, SseAuthGuard, SupabaseAuthGuard, JwtAuthGuard, RolesGuard, SupabaseSyncMiddleware, ApplicationStatusChangedHandler, ApplicationSubmittedHandler, ApplicationWithdrawnHandler, OfferCreatedHandler, OfferDeletedHandler, InterviewSlotProposedHandler, InterviewSlotRespondedHandler],
    exports: [SupabaseSyncMiddleware],
})
export class HttpApiModule {}
