"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistenceModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const user_mapper_1 = require("./prisma/mappers/user.mapper");
const student_profile_mapper_1 = require("./prisma/mappers/student-profile.mapper");
const recruiter_profile_mapper_1 = require("./prisma/mappers/recruiter-profile.mapper");
const offer_mapper_1 = require("./prisma/mappers/offer.mapper");
const skill_mapper_1 = require("./prisma/mappers/skill.mapper");
const skill_assignment_mapper_1 = require("./prisma/mappers/skill-assignment.mapper");
const application_mapper_1 = require("./prisma/mappers/application.mapper");
const cv_mapper_1 = require("./prisma/mappers/cv.mapper");
const cover_letter_mapper_1 = require("./prisma/mappers/cover-letter.mapper");
const experience_mapper_1 = require("./prisma/mappers/experience.mapper");
const education_mapper_1 = require("./prisma/mappers/education.mapper");
const certification_mapper_1 = require("./prisma/mappers/certification.mapper");
const project_mapper_1 = require("./prisma/mappers/project.mapper");
const user_repository_1 = require("../../Application/repositories/user.repository");
const student_profile_repository_1 = require("../../Application/repositories/student-profile.repository");
const recruiter_profile_repository_1 = require("../../Application/repositories/recruiter-profile.repository");
const offer_repository_1 = require("../../Application/repositories/offer.repository");
const skill_repository_1 = require("../../Application/repositories/skill.repository");
const skill_assignment_repository_1 = require("../../Application/repositories/skill-assignment.repository");
const application_repository_1 = require("../../Application/repositories/application.repository");
const cv_repository_1 = require("../../Application/repositories/cv.repository");
const experience_repository_1 = require("../../Application/repositories/experience.repository");
const education_repository_1 = require("../../Application/repositories/education.repository");
const certification_repository_1 = require("../../Application/repositories/certification.repository");
const project_repository_1 = require("../../Application/repositories/project.repository");
const user_prisma_repository_1 = require("./prisma/repositories/user.prisma.repository");
const student_profile_repository_2 = require("./prisma/repositories/student-profile.repository");
const recruiter_profile_repository_2 = require("./prisma/repositories/recruiter-profile.repository");
const offer_repository_2 = require("./prisma/repositories/offer.repository");
const cv_repository_2 = require("./prisma/repositories/cv.repository");
const certification_repository_2 = require("./prisma/repositories/certification.repository");
const education_repository_2 = require("./prisma/repositories/education.repository");
const experience_repository_2 = require("./prisma/repositories/experience.repository");
const cover_letter_repository_1 = require("./prisma/repositories/cover-letter.repository");
const application_repository_2 = require("./prisma/repositories/application.repository");
const skill_assignment_repository_2 = require("./prisma/repositories/skill-assignment.repository");
const project_repository_2 = require("./prisma/repositories/project.repository");
const coverletter_repository_1 = require("../../Application/repositories/coverletter.repository");
const skill_repository_2 = require("./prisma/repositories/skill.repository");
const repositories = [
    { provide: user_repository_1.IUserRepository, useClass: user_prisma_repository_1.UserRepositoryImpl },
    { provide: student_profile_repository_1.IStudentProfileRepository, useClass: student_profile_repository_2.StudentProfileRepositoryImpl },
    { provide: recruiter_profile_repository_1.IRecruiterProfileRepository, useClass: recruiter_profile_repository_2.RecruiterProfileRepositoryImpl },
    { provide: offer_repository_1.IOfferRepository, useClass: offer_repository_2.OfferRepositoryImpl },
    { provide: skill_repository_1.ISkillRepository, useClass: skill_repository_2.SkillRepositoryImpl },
    { provide: skill_assignment_repository_1.ISkillAssignmentRepository, useClass: skill_assignment_repository_2.SkillAssignmentRepositoryImpl },
    { provide: application_repository_1.IApplicationRepository, useClass: application_repository_2.ApplicationRepositoryImpl },
    { provide: cv_repository_1.ICVRepository, useClass: cv_repository_2.CVRepositoryImpl },
    { provide: coverletter_repository_1.ICoverLetterRepository, useClass: cover_letter_repository_1.CoverLetterRepositoryImpl },
    { provide: experience_repository_1.IExperienceRepository, useClass: experience_repository_2.ExperienceRepositoryImpl },
    { provide: education_repository_1.IEducationRepository, useClass: education_repository_2.EducationRepositoryImpl },
    { provide: certification_repository_1.ICertificationRepository, useClass: certification_repository_2.CertificationRepositoryImpl },
    { provide: project_repository_1.IProjectRepository, useClass: project_repository_2.ProjectRepositoryImpl },
];
const mappers = [
    user_mapper_1.UserMapper,
    student_profile_mapper_1.StudentProfileMapper,
    recruiter_profile_mapper_1.RecruiterProfileMapper,
    offer_mapper_1.OfferMapper,
    skill_mapper_1.SkillMapper,
    skill_assignment_mapper_1.SkillAssignmentMapper,
    application_mapper_1.ApplicationMapper,
    cv_mapper_1.CVMapper,
    cover_letter_mapper_1.CoverLetterMapper,
    experience_mapper_1.ExperienceMapper,
    education_mapper_1.EducationMapper,
    certification_mapper_1.CertificationMapper,
    project_mapper_1.ProjectMapper,
];
let PersistenceModule = class PersistenceModule {
};
exports.PersistenceModule = PersistenceModule;
exports.PersistenceModule = PersistenceModule = __decorate([
    (0, common_1.Module)({
        providers: [
            prisma_service_1.PrismaService,
            ...mappers,
            ...repositories,
        ],
        exports: [
            user_repository_1.IUserRepository,
            student_profile_repository_1.IStudentProfileRepository,
            recruiter_profile_repository_1.IRecruiterProfileRepository,
            offer_repository_1.IOfferRepository,
            skill_repository_1.ISkillRepository,
            skill_assignment_repository_1.ISkillAssignmentRepository,
            application_repository_1.IApplicationRepository,
            cv_repository_1.ICVRepository,
            coverletter_repository_1.ICoverLetterRepository,
            experience_repository_1.IExperienceRepository,
            education_repository_1.IEducationRepository,
            certification_repository_1.ICertificationRepository,
            project_repository_1.IProjectRepository,
        ],
    })
], PersistenceModule);
//# sourceMappingURL=persistence.module.js.map