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
        OnboardController],
    providers: [OnboardService],
})
export class HttpApiModule {}
