// persistence.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

// Mappers
import { UserMapper } from './prisma/mappers/user.mapper';
import { StudentProfileMapper } from './prisma/mappers/student-profile.mapper';
import { RecruiterProfileMapper } from './prisma/mappers/recruiter-profile.mapper';
import { OfferMapper } from './prisma/mappers/offer.mapper';
import { SkillMapper } from './prisma/mappers/skill.mapper';
import { SkillAssignmentMapper } from './prisma/mappers/skill-assignment.mapper';
import { ApplicationMapper } from './prisma/mappers/application.mapper';
import { CVMapper } from './prisma/mappers/cv.mapper';
import { CoverLetterMapper } from './prisma/mappers/cover-letter.mapper';
import { ExperienceMapper } from './prisma/mappers/experience.mapper';
import { EducationMapper } from './prisma/mappers/education.mapper';
import { CertificationMapper } from './prisma/mappers/certification.mapper';
import { ProjectMapper } from './prisma/mappers/project.mapper';
import { InterviewMapper } from './prisma/mappers/interview.mapper';
import { SchoolMapper } from './prisma/mappers/school.mapper';
import { OfferViewMapper } from './prisma/mappers/offer-view.mapper';
import { OfferBookmarkMapper } from './prisma/mappers/offer-bookmark.mapper';
import { OfferImpressionMapper } from './prisma/mappers/offer-impression.mapper';
import { ProfileViewMapper } from './prisma/mappers/profile-view.mapper';
import { SearchQueryMapper } from './prisma/mappers/search-query.mapper';
import { RecommendationScoreMapper } from './prisma/mappers/recommendation-score.mapper';

// Interfaces
import { IUserRepository } from '../../Application/repositories/user.repository';
import { IStudentProfileRepository } from '../../Application/repositories/student-profile.repository';
import { IRecruiterProfileRepository } from '../../Application/repositories/recruiter-profile.repository';
import { IOfferRepository } from '../../Application/repositories/offer.repository';
import { ISkillRepository } from '../../Application/repositories/skill.repository';
import { ISkillAssignmentRepository } from '../../Application/repositories/skill-assignment.repository';
import { IApplicationRepository } from '../../Application/repositories/application.repository';
import { ICVRepository } from '../../Application/repositories/cv.repository';
import { IExperienceRepository } from '../../Application/repositories/experience.repository';
import { IEducationRepository } from '../../Application/repositories/education.repository';
import { ICertificationRepository } from '../../Application/repositories/certification.repository';
import { IProjectRepository } from '../../Application/repositories/project.repository';
import { IInterviewRepository } from '../../Application/repositories/interview.repository';
import { ICoverLetterRepository } from '../../Application/repositories/coverletter.repository';
import { ISchoolRepository } from '../../Application/repositories/school.repository';
import { IOfferViewRepository } from '../../Application/repositories/offer-view.repository';
import { IOfferBookmarkRepository } from '../../Application/repositories/offer-bookmark.repository';
import { IOfferImpressionRepository } from '../../Application/repositories/offer-impression.repository';
import { IProfileViewRepository } from '../../Application/repositories/profile-view.repository';
import { ISearchQueryRepository } from '../../Application/repositories/search-query.repository';
import { IRecommendationScoreRepository } from '../../Application/repositories/recommendation-score.repository';

// Implementations
import { UserRepositoryImpl } from './prisma/repositories/user.prisma.repository';
import { StudentProfileRepositoryImpl } from './prisma/repositories/student-profile.repository';
import { RecruiterProfileRepositoryImpl } from './prisma/repositories/recruiter-profile.repository';
import { OfferRepositoryImpl } from './prisma/repositories/offer.repository';
import { CVRepositoryImpl } from './prisma/repositories/cv.repository';
import { CertificationRepositoryImpl } from './prisma/repositories/certification.repository';
import { EducationRepositoryImpl } from './prisma/repositories/education.repository';
import { ExperienceRepositoryImpl } from './prisma/repositories/experience.repository';
import { CoverLetterRepositoryImpl } from './prisma/repositories/cover-letter.repository';
import { ApplicationRepositoryImpl } from './prisma/repositories/application.repository';
import { SkillAssignmentRepositoryImpl } from './prisma/repositories/skill-assignment.repository';
import { ProjectRepositoryImpl } from './prisma/repositories/project.repository';
import { InterviewRepositoryImpl } from './prisma/repositories/interview.repository';
import { SkillRepositoryImpl } from './prisma/repositories/skill.repository';
import { SchoolRepositoryImpl } from './prisma/repositories/school.repository';
import { OfferViewRepositoryImpl } from './prisma/repositories/offer-view.repository';
import { OfferBookmarkRepositoryImpl } from './prisma/repositories/offer-bookmark.repository';
import { OfferImpressionRepositoryImpl } from './prisma/repositories/offer-impression.repository';
import { ProfileViewRepositoryImpl } from './prisma/repositories/profile-view.repository';
import { SearchQueryRepositoryImpl } from './prisma/repositories/search-query.repository';
import { RecommendationScoreRepositoryImpl } from './prisma/repositories/recommendation-score.repository';

const repositories = [
    { provide: IUserRepository,                  useClass: UserRepositoryImpl },
    { provide: IStudentProfileRepository,        useClass: StudentProfileRepositoryImpl },
    { provide: IRecruiterProfileRepository,      useClass: RecruiterProfileRepositoryImpl },
    { provide: IOfferRepository,                 useClass: OfferRepositoryImpl },
    { provide: ISkillRepository,                 useClass: SkillRepositoryImpl },
    { provide: ISkillAssignmentRepository,       useClass: SkillAssignmentRepositoryImpl },
    { provide: IApplicationRepository,           useClass: ApplicationRepositoryImpl },
    { provide: ICVRepository,                    useClass: CVRepositoryImpl },
    { provide: ICoverLetterRepository,           useClass: CoverLetterRepositoryImpl },
    { provide: IExperienceRepository,            useClass: ExperienceRepositoryImpl },
    { provide: IEducationRepository,             useClass: EducationRepositoryImpl },
    { provide: ICertificationRepository,         useClass: CertificationRepositoryImpl },
    { provide: IProjectRepository,               useClass: ProjectRepositoryImpl },
    { provide: IInterviewRepository,             useClass: InterviewRepositoryImpl },
    { provide: ISchoolRepository,                useClass: SchoolRepositoryImpl },
    { provide: IOfferViewRepository,             useClass: OfferViewRepositoryImpl },
    { provide: IOfferBookmarkRepository,         useClass: OfferBookmarkRepositoryImpl },
    { provide: IOfferImpressionRepository,       useClass: OfferImpressionRepositoryImpl },
    { provide: IProfileViewRepository,           useClass: ProfileViewRepositoryImpl },
    { provide: ISearchQueryRepository,           useClass: SearchQueryRepositoryImpl },
    { provide: IRecommendationScoreRepository,   useClass: RecommendationScoreRepositoryImpl },
]

const mappers = [
    UserMapper,
    StudentProfileMapper,
    RecruiterProfileMapper,
    OfferMapper,
    SkillMapper,
    SkillAssignmentMapper,
    ApplicationMapper,
    CVMapper,
    CoverLetterMapper,
    ExperienceMapper,
    EducationMapper,
    CertificationMapper,
    ProjectMapper,
    InterviewMapper,
    SchoolMapper,
    OfferViewMapper,
    OfferBookmarkMapper,
    OfferImpressionMapper,
    ProfileViewMapper,
    SearchQueryMapper,
    RecommendationScoreMapper,
]

@Module({
    providers: [
        PrismaService,
        ...mappers,
        ...repositories,
    ],
    exports: [
        PrismaService,
        IUserRepository,
        IStudentProfileRepository,
        IRecruiterProfileRepository,
        IOfferRepository,
        ISkillRepository,
        ISkillAssignmentRepository,
        IApplicationRepository,
        ICVRepository,
        ICoverLetterRepository,
        IExperienceRepository,
        IEducationRepository,
        ICertificationRepository,
        IProjectRepository,
        IInterviewRepository,
        ISchoolRepository,
        IOfferViewRepository,
        IOfferBookmarkRepository,
        IOfferImpressionRepository,
        IProfileViewRepository,
        ISearchQueryRepository,
        IRecommendationScoreRepository,
    ],
})
export class PersistenceModule {}
