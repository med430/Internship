import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PersistenceModule } from '../Infrastructure/Persistence/persistence.module';
import { FileStorageModule } from '../Infrastructure/storage/file.module';

// ── Command handlers ───────────────────────────────────────
import { RegisterRecruiterHandler } from './Features/AuthFeature/Commands/handlers/register-recruiter.handler';
import { RegisterStudentHandler } from './Features/AuthFeature/Commands/handlers/register-student.handler';
import { CreateOfferHandler } from './Features/OfferFeature/Commands/handlers/create-offer.handler';
import { UpdateOfferHandler } from './Features/OfferFeature/Commands/handlers/update-offer.handler';
import { DeleteOfferHandler } from './Features/OfferFeature/Commands/handlers/delete-offer.handler';
import { ApplyToOfferHandler } from './Features/ApplicationFeature/Commands/handlers/apply-offer.handler';
import { UpdateApplicationStatusHandler } from './Features/ApplicationFeature/Commands/handlers/update-application-status.handler';
import { WithdrawApplicationHandler } from './Features/ApplicationFeature/Commands/handlers/withdraw-application.handler';
import { DownloadApplicationFileHandler } from './Features/ApplicationFeature/Commands/handlers/download-file.handler';
import { CreateCertificationHandler } from './Features/CertificationFeature/Commands/handlers/create-certification.handler';
import { DeleteCertificationHandler } from './Features/CertificationFeature/Commands/handlers/delete-certification.handler';
import { UpdateCertificationHandler } from './Features/CertificationFeature/Commands/handlers/update-certification.handler';
import { DeleteCoverLetterHandler } from './Features/CoverLetterFeature/Commands/handlers/delete-cover-letter.handler';
import { UploadCoverLetterHandler } from './Features/CoverLetterFeature/Commands/handlers/upload-cover-letter.handler';
import { DownloadOwnCoverLetterHandler } from './Features/CoverLetterFeature/Commands/handlers/download-own-cover-letter.handler';
import { DeleteCVHandler } from './Features/CvFeature/Commands/handlers/delete-cv.handler';
import { UploadCVHandler } from './Features/CvFeature/Commands/handlers/upload-cv.handler';
import { DownloadOwnCVHandler } from './Features/CvFeature/Commands/handlers/download-own-cv.handler';
import { CreateEducationHandler } from './Features/EducationFeature/Commands/handlers/create-education.handler';
import { UpdateEducationHandler } from './Features/EducationFeature/Commands/handlers/update-education.handler';
import { DeleteEducationHandler } from './Features/EducationFeature/Commands/handlers/delete-education.handler';
import { CreateExperienceHandler } from './Features/ExperienceFeature/Commands/handlers/create-experience.handler';
import { UpdateExperienceHandler } from './Features/ExperienceFeature/Commands/handlers/update-experience.handler';
import { DeleteExperienceHandler } from './Features/ExperienceFeature/Commands/handlers/delete-experience.handler';
import { CreateProjectHandler } from './Features/ProjectFeature/Commands/handlers/create-project.handler';
import { UpdateProjectHandler } from './Features/ProjectFeature/Commands/handlers/update-project.handler';
import { DeleteProjectHandler } from './Features/ProjectFeature/Commands/handlers/delete-project.handler';
import { SoftDeleteUserHandler } from './Features/ProfileFeature/Commands/handlers/soft-delete-user.handler';
import { UpdateStudentProfileHandler } from './Features/ProfileFeature/Commands/handlers/update-student-profile.handler';
import { UpdateRecruiterProfileHandler } from './Features/ProfileFeature/Commands/handlers/update-recruiter-profile.handler';
import { UploadAvatarHandler } from './Features/ProfileFeature/Commands/handlers/upload-avatar.handler';
import { AssignSkillHandler } from './Features/SkillAssignmentFeature/Commands/handlers/assign-skill.handler';
import { RemoveSkillHandler } from './Features/SkillAssignmentFeature/Commands/handlers/remove-skill.handler';
import { UpdateSkillHandler } from './Features/SkillAssignmentFeature/Commands/handlers/update-skill.handler';
import { StartInterviewHandler } from './Features/InterviewFeature/Commands/handlers/start-interview.handler';
import { AnswerInterviewHandler } from './Features/InterviewFeature/Commands/handlers/answer-interview.handler';
import { UpdateUserRoleHandler } from './Features/UserFeature/Commands/handlers/update-user-role.handler';

// ── Query handlers ─────────────────────────────────────────
import { GetUserQueryHandler } from './Features/UserFeature/Queries/handlers/get-user-query.handler';
import { GetUsersQueryHandler } from './Features/UserFeature/Queries/handlers/get-users-query.handler';
import { GetOfferQueryHandler } from './Features/OfferFeature/Queries/handlers/get-offer-query.handler';
import { GetOffersQueryHandler } from './Features/OfferFeature/Queries/handlers/get-offers-query.handler';
import { GetMyOffersQueryHandler } from './Features/OfferFeature/Queries/handlers/get-my-offers.handler';
import { GetSkillQueryHandler } from './Features/SkillFeature/Queries/handlers/get-skill-query.handler';
import { GetSkillsQueryHandler } from './Features/SkillFeature/Queries/handlers/get-skills-query.handler';
import { GetSkillAssignmentQueryHandler } from './Features/SkillAssignmentFeature/Queries/handlers/get-skill-assignment-query.handler';
import { GetSkillAssignmentsQueryHandler } from './Features/SkillAssignmentFeature/Queries/handlers/get-skill-assignments-query.handler';
import { GetApplicationQueryHandler } from './Features/ApplicationFeature/Queries/handlers/get-application.handler';
import { GetApplicationsQueryHandler } from './Features/ApplicationFeature/Queries/handlers/get-applications.handler';
import { GetCVQueryHandler } from './Features/CvFeature/Queries/handlers/get-cv.handler';
import { GetCVsQueryHandler } from './Features/CvFeature/Queries/handlers/get-cvs.handler';
import { GetCoverLetterQueryHandler } from './Features/CoverLetterFeature/Queries/handlers/get-cover-letter.handler';
import { GetCoverLettersQueryHandler } from './Features/CoverLetterFeature/Queries/handlers/get-cover-letters.handler';
import { ListOwnCoverLettersHandler } from './Features/CoverLetterFeature/Queries/handlers/list-own-cover-letters.handler';
import { GetOwnCoverLetterHandler } from './Features/CoverLetterFeature/Queries/handlers/get-own-cover-letter.handler';
import { GetStudentProfileQueryHandler } from './Features/StudentProfileFeature/Queries/handlers/get-student-profile-query.handler';
import { GetStudentProfilesQueryHandler } from './Features/StudentProfileFeature/Queries/handlers/get-student-profiles-query.handler';
import { GetRecruiterProfileQueryHandler } from './Features/RecruiterProfileFeature/Queries/handlers/get-recruiter-profile.handler';
import { GetRecruiterProfilesQueryHandler } from './Features/RecruiterProfileFeature/Queries/handlers/get-recruiter-profiles.handler';
import { GetProjectQueryHandler } from './Features/ProjectFeature/Queries/handlers/get-project.handler';
import { GetProjectsQueryHandler } from './Features/ProjectFeature/Queries/handlers/get-projects.handler';
import { GetExperienceQueryHandler } from './Features/ExperienceFeature/Queries/handlers/get-experience.handler';
import { GetExperiencesQueryHandler } from './Features/ExperienceFeature/Queries/handlers/get-experiences.handler';
import { GetEducationQueryHandler } from './Features/EducationFeature/Queries/handlers/get-education.handler';
import { GetEducationsQueryHandler } from './Features/EducationFeature/Queries/handlers/get-educations.handler';
import { GetCertificationQueryHandler } from './Features/CertificationFeature/Queries/handlers/get-certification.handler';
import { GetCertificationsQueryHandler } from './Features/CertificationFeature/Queries/handlers/get-certifications.handler';
import { GetInterviewQueryHandler } from './Features/InterviewFeature/Queries/handlers/get-interview.handler';
import { GetInterviewsQueryHandler } from './Features/InterviewFeature/Queries/handlers/get-interviews.handler';
import { GetRecommendationQueryHandler } from './Features/RecommendationFeature/Queries/handlers/get-recommendation.handler';
import { GetRecommendationsQueryHandler } from './Features/RecommendationFeature/Queries/handlers/get-recommendations.handler';
import { InterviewAiService } from './Services/InterviewService/interview-ai.service';
import { ContentScoringService } from './Services/RecommendationService/content-scoring.service';
import { ScoringService } from './Services/RecommendationService/scoring.service';
import { RecommendationCronService } from './Services/RecommendationService/recommendation-cron.service';
import { EventCleanupCronService } from './Services/RecommendationService/event-cleanup-cron.service';
import { IMlClient } from './Services/RecommendationService/ml-client.interface';
import { MlClientService } from './Services/RecommendationService/ml-client.service';
import { MlClientMock } from './Services/RecommendationService/ml-client.mock';
import { ComputeRecommendationsHandler } from './Features/OfferRecommendationFeature/Commands/handlers/compute-recommendations.handler';
import { GetRecommendedOffersHandler } from './Features/OfferRecommendationFeature/Queries/handlers/get-recommended-offers.handler';
import { CreateConversationHandler } from './Features/ChatFeature/Commands/handlers/create-conversation.handler';
import { SendMessageHandler } from './Features/ChatFeature/Commands/handlers/send-message.handler';
import { GetConversationsHandler } from './Features/ChatFeature/Queries/handlers/get-conversations.handler';
import { GetMessagesHandler } from './Features/ChatFeature/Queries/handlers/get-messages.handler';
import { ChatPersistenceModule } from '../Infrastructure/chat/chat-persistence.module';
import { NotificationPersistenceModule } from '../Infrastructure/notifications/notification-persistence.module';
import { OfferFeedService } from './Features/OfferRecommendationFeature/offer-feed.service';
import { SupabaseAuthBridge } from './Services/AuthBridge/supabase-auth-bridge.service';
import { GetNotificationsHandler } from './Features/NotificationFeature/Queries/handlers/get-notifications.handler'
import { ProposeInterviewSlotHandler } from './Features/InterviewSlotFeature/Commands/handlers/propose-interview-slot.handler'
import { RespondToInterviewSlotHandler } from './Features/InterviewSlotFeature/Commands/handlers/respond-to-interview-slot.handler'
import { GetMyInterviewSlotsHandler } from './Features/InterviewSlotFeature/Queries/handlers/get-my-interview-slots.handler';
import { MarkNotificationReadHandler } from './Features/NotificationFeature/Commands/handlers/mark-notification-read.handler';
import { MarkAllNotificationsReadHandler } from './Features/NotificationFeature/Commands/handlers/mark-all-notifications-read.handler';
import { DeleteNotificationHandler } from './Features/NotificationFeature/Commands/handlers/delete-notification.handler';
import { UpgradeSubscriptionHandler } from './Features/SubscriptionFeature/Commands/handlers/upgrade-subscription.handler';
import { CancelSubscriptionHandler } from './Features/SubscriptionFeature/Commands/handlers/cancel-subscription.handler';
import { GetMySubscriptionHandler } from './Features/SubscriptionFeature/Queries/handlers/get-my-subscription.handler';

// Local dev guard: skip chat handlers + ChatPersistenceModule when CHAT_DB_URL is unset (no MongoDB available).
const chatEnabled = !!process.env.CHAT_DB_URL;

const CommandHandlers = [
  RegisterStudentHandler,
  RegisterRecruiterHandler,
  CreateOfferHandler,
  UpdateOfferHandler,
  DeleteOfferHandler,
  ApplyToOfferHandler,
  UpdateApplicationStatusHandler,
  WithdrawApplicationHandler,
  DownloadApplicationFileHandler,
  CreateCertificationHandler,
  UpdateCertificationHandler,
  DeleteCertificationHandler,
  DeleteCoverLetterHandler,
  UploadCoverLetterHandler,
  DownloadOwnCoverLetterHandler,
  DeleteCVHandler,
  UploadCVHandler,
  DownloadOwnCVHandler,
  CreateEducationHandler,
  UpdateEducationHandler,
  DeleteEducationHandler,
  CreateExperienceHandler,
  UpdateExperienceHandler,
  DeleteExperienceHandler,
  CreateProjectHandler,
  UpdateProjectHandler,
  DeleteProjectHandler,
  SoftDeleteUserHandler,
  UpdateStudentProfileHandler,
  UpdateRecruiterProfileHandler,
  UploadAvatarHandler,
  AssignSkillHandler,
  RemoveSkillHandler,
  UpdateSkillHandler,
  StartInterviewHandler,
  AnswerInterviewHandler,
  ComputeRecommendationsHandler,
  UpdateUserRoleHandler,
  CreateConversationHandler,
  SendMessageHandler,
  ProposeInterviewSlotHandler,
  RespondToInterviewSlotHandler,
  UpgradeSubscriptionHandler,
  CancelSubscriptionHandler,
  ...(chatEnabled ? [CreateConversationHandler, SendMessageHandler] : []),
];

const NotificationHandlers = [
  GetNotificationsHandler,
  MarkNotificationReadHandler,
  MarkAllNotificationsReadHandler,
  DeleteNotificationHandler,
];

const QueryHandlers = [
  // Users
  GetUserQueryHandler,
  GetUsersQueryHandler,
  // Offers
  GetOfferQueryHandler,
  GetOffersQueryHandler,
  GetMyOffersQueryHandler,
  // Skills
  GetSkillQueryHandler,
  GetSkillsQueryHandler,
  // Skill assignments
  GetSkillAssignmentQueryHandler,
  GetSkillAssignmentsQueryHandler,
  // Applications
  GetApplicationQueryHandler,
  GetApplicationsQueryHandler,
  // CVs
  GetCVQueryHandler,
  GetCVsQueryHandler,
  // Cover letters
  GetCoverLetterQueryHandler,
  GetCoverLettersQueryHandler,
  ListOwnCoverLettersHandler,
  GetOwnCoverLetterHandler,
  // Profiles
  GetStudentProfileQueryHandler,
  GetStudentProfilesQueryHandler,
  GetRecruiterProfileQueryHandler,
  GetRecruiterProfilesQueryHandler,
  // Projects
  GetProjectQueryHandler,
  GetProjectsQueryHandler,
  // Experiences
  GetExperienceQueryHandler,
  GetExperiencesQueryHandler,
  // Educations
  GetEducationQueryHandler,
  GetEducationsQueryHandler,
  // Certifications
  GetCertificationQueryHandler,
  GetCertificationsQueryHandler,
  // Interviews
  GetInterviewQueryHandler,
  GetInterviewsQueryHandler,
  // Recommendation feed
  GetRecommendedOffersHandler,
  // Chat
  GetConversationsHandler,
  GetMessagesHandler,
  // Interview slots
  GetMyInterviewSlotsHandler,
  // Subscription
  GetMySubscriptionHandler,
  // Chat (skipped when CHAT_DB_URL unset)
  ...(chatEnabled ? [GetConversationsHandler, GetMessagesHandler] : []),
];

@Global()
@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    FileStorageModule,
    PersistenceModule,
    ChatPersistenceModule,
    NotificationPersistenceModule,
    ...(chatEnabled ? [ChatPersistenceModule] : []),
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...NotificationHandlers,
    InterviewAiService,
    ContentScoringService,
    ScoringService,
    RecommendationCronService,
    EventCleanupCronService,
    OfferFeedService,
    SupabaseAuthBridge,
    {
      provide: IMlClient,
      useFactory: (cfg: ConfigService) =>
        cfg.get<string>('ML_MOCK') === 'true' ? new MlClientMock() : new MlClientService(cfg),
      inject: [ConfigService],
    },
  ],
  exports: [
    CqrsModule,
    FileStorageModule,
    PersistenceModule,
    NotificationPersistenceModule,
    InterviewAiService,
    ContentScoringService,
    ScoringService,
    RecommendationCronService,
    EventCleanupCronService,
    OfferFeedService,
    SupabaseAuthBridge,
    IMlClient,
  ],
})
export class ApplicationModule {}
