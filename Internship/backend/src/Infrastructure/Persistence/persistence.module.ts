// persistence.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

// Repositories
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
import { ICoverLetterRepository } from '../../Application/repositories/coverletter.repository';
import { SkillRepositoryImpl } from './prisma/repositories/skill.repository';

const repositories = [
    { provide: IUserRepository,             useClass: UserRepositoryImpl },
    { provide: IStudentProfileRepository,   useClass: StudentProfileRepositoryImpl },
    { provide: IRecruiterProfileRepository, useClass: RecruiterProfileRepositoryImpl },
    { provide: IOfferRepository,            useClass: OfferRepositoryImpl },
    { provide: ISkillRepository,            useClass: SkillRepositoryImpl },
    { provide: ISkillAssignmentRepository,  useClass: SkillAssignmentRepositoryImpl },
    { provide: IApplicationRepository,      useClass: ApplicationRepositoryImpl },
    { provide: ICVRepository,               useClass: CVRepositoryImpl },
    { provide: ICoverLetterRepository,      useClass: CoverLetterRepositoryImpl },
    { provide: IExperienceRepository,       useClass: ExperienceRepositoryImpl },
    { provide: IEducationRepository,        useClass: EducationRepositoryImpl },
    { provide: ICertificationRepository,    useClass: CertificationRepositoryImpl },
    { provide: IProjectRepository,          useClass: ProjectRepositoryImpl },
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
]

@Module({
    providers: [
        PrismaService,
        ...mappers,
        ...repositories,
    ],
    exports: [
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
    ],
})
export class PersistenceModule {}