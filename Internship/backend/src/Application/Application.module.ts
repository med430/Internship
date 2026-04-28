import {Global, Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {LoginHandler} from "./Features/AuthFeature/Commands/handlers/login.handler";
import {AuthService} from "./Services/AuthService/AuthService";
import {PersistenceModule} from "../Infrastructure/Persistence/persistence.module";
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {JwtAuthService} from "../Infrastructure/auth/jwt-auth.service";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "../API/http/guards/jwt.strategy";
import {CreateOfferHandler} from "./Features/OfferFeature/Commands/handlers/create-offer.handler";
import {UpdateOfferHandler} from "./Features/OfferFeature/Commands/handlers/update-offer.handler";
import {DeleteOfferHandler} from "./Features/OfferFeature/Commands/handlers/delete-offer.handler";
import {ApplyToOfferHandler} from "./Features/ApplicationFeature/Commands/handlers/apply-offer.handler";
import { GetUsersQueryHandler } from './Features/UserFeature/Queries/handlers/get-users-query.handler';
import { GetOffersQueryHandler } from './Features/OfferFeature/Queries/handlers/get-offers-query.handler';
import { GetOfferQueryHandler } from './Features/OfferFeature/Queries/handlers/get-offer-query.handler';
import { GetUserQueryHandler } from './Features/UserFeature/Queries/handlers/get-user-query.handler';
import { GetSkillQueryHandler } from './Features/SkillFeature/Queries/handlers/get-skill-query.handler';
import { GetSkillsQueryHandler } from './Features/SkillFeature/Queries/handlers/get-skills-query.handler';
import {
  UpdateApplicationStatusHandler
} from "./Features/ApplicationFeature/Commands/handlers/update-application-status.handler";
import {WithdrawApplicationHandler} from "./Features/ApplicationFeature/Commands/handlers/withdraw-application.handler";
import {DownloadApplicationFileHandler} from "./Features/ApplicationFeature/Commands/handlers/download-file.handler";
import {RegisterRecruiterHandler} from "./Features/AuthFeature/Commands/handlers/register-recruiter.handler";
import {RegisterStudentHandler} from "./Features/AuthFeature/Commands/handlers/register-student.handler";
import {
  CreateCertificationHandler
} from "./Features/CertificationFeature/Commands/handlers/create-certification.handler";
import {
  DeleteCertificationHandler
} from "./Features/CertificationFeature/Commands/handlers/delete-certification.handler";
import {
  UpdateCertificationHandler
} from "./Features/CertificationFeature/Commands/handlers/update-certification.handler";
import {DeleteCoverLetterHandler} from "./Features/CoverLetterFeature/Commands/handlers/delete-cover-letter.handler";
import {UploadCoverLetterHandler} from "./Features/CoverLetterFeature/Commands/handlers/upload-cover-letter.handler";
import {DeleteCVHandler} from "./Features/CvFeature/Commands/handlers/delete-cv.handler";
import {UploadCVHandler} from "./Features/CvFeature/Commands/handlers/upload-cv.handler";
import {CreateEducationHandler} from "./Features/EducationFeature/Commands/handlers/create-education.handler";
import {UpdateEducationHandler} from "./Features/EducationFeature/Commands/handlers/update-education.handler";
import {DeleteEducationHandler} from "./Features/EducationFeature/Commands/handlers/delete-education.handler";
import {CreateExperienceCommand} from "./Features/ExperienceFeature/Commands/create-experience.command";
import {UpdateExperienceHandler} from "./Features/ExperienceFeature/Commands/handlers/update-experience.handler";
import {CreateExperienceHandler} from "./Features/ExperienceFeature/Commands/handlers/create-experience.handler";
import {DeleteExperienceHandler} from "./Features/ExperienceFeature/Commands/handlers/delete-experience.handler";
import {CreateProjectHandler} from "./Features/ProjectFeature/Commands/handlers/create-project.handler";
import {UpdateProjectHandler} from "./Features/ProjectFeature/Commands/handlers/update-project.handler";
import {DeleteProjectHandler} from "./Features/ProjectFeature/Commands/handlers/delete-project.handler";
import {SoftDeleteUserHandler} from "./Features/ProfileFeature/Commands/handlers/soft-delete-user.handler";
import {UpdateStudentProfileHandler} from "./Features/ProfileFeature/Commands/handlers/update-student-profile.handler";
import {
  UpdateRecruiterProfileHandler
} from "./Features/ProfileFeature/Commands/handlers/update-recruiter-profile.handler";
import {AssignSkillHandler} from "./Features/SkillAssignmentFeature/Commands/handlers/assign-skill.handler";
import {RemoveSkillHandler} from "./Features/SkillAssignmentFeature/Commands/handlers/remove-skill.handler";
import {UpdateSkillHandler} from "./Features/SkillAssignmentFeature/Commands/handlers/update-skill.handler";


const CommandHandlers = [
  LoginHandler,
  CreateOfferHandler,
  UpdateOfferHandler,
  DeleteOfferHandler,
  CreateEducationHandler,
  UpdateEducationHandler,
  DeleteEducationHandler,
  CreateExperienceHandler,
  UpdateExperienceHandler,
  DeleteExperienceHandler,
  CreateProjectHandler,
  UpdateProjectHandler,
  DeleteProjectHandler,
  ApplyToOfferHandler,
  UpdateApplicationStatusHandler,
  WithdrawApplicationHandler,
  DownloadApplicationFileHandler,
  RegisterRecruiterHandler,
  RegisterStudentHandler,
  CreateCertificationHandler,
  DeleteCertificationHandler,
  UpdateCertificationHandler,
  DeleteCoverLetterHandler,
  UploadCoverLetterHandler,
  DeleteCVHandler,
  UploadCVHandler,
  SoftDeleteUserHandler,
  UpdateRecruiterProfileHandler,
  UpdateStudentProfileHandler,
  AssignSkillHandler,
  RemoveSkillHandler,
  UpdateSkillHandler,

];

const QueryHandlers = [
  GetUserQueryHandler,
  GetUsersQueryHandler,
  GetOfferQueryHandler,
  GetOffersQueryHandler,
  GetSkillQueryHandler,
  GetSkillsQueryHandler,
];

@Global()
@Module({
  imports: [
    CqrsModule,
    PersistenceModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get('JWT_EXPIRATION_TIME') || 3600)
        },
      }),
    }),
  ],

  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
      JwtStrategy,
    {
      provide: AuthService,
      useClass: JwtAuthService,
    },
  ],

  exports: [
    CqrsModule
  ],
})
export class ApplicationModule {}