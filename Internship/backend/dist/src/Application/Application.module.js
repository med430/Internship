"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const persistence_module_1 = require("../Infrastructure/Persistence/persistence.module");
const AuthService_1 = require("./Services/AuthService/AuthService");
const jwt_auth_service_1 = require("../Infrastructure/auth/jwt-auth.service");
const jwt_strategy_1 = require("../API/http/guards/jwt.strategy");
const login_handler_1 = require("./Features/AuthFeature/Commands/handlers/login.handler");
const register_recruiter_handler_1 = require("./Features/AuthFeature/Commands/handlers/register-recruiter.handler");
const register_student_handler_1 = require("./Features/AuthFeature/Commands/handlers/register-student.handler");
const create_offer_handler_1 = require("./Features/OfferFeature/Commands/handlers/create-offer.handler");
const update_offer_handler_1 = require("./Features/OfferFeature/Commands/handlers/update-offer.handler");
const delete_offer_handler_1 = require("./Features/OfferFeature/Commands/handlers/delete-offer.handler");
const apply_offer_handler_1 = require("./Features/ApplicationFeature/Commands/handlers/apply-offer.handler");
const update_application_status_handler_1 = require("./Features/ApplicationFeature/Commands/handlers/update-application-status.handler");
const withdraw_application_handler_1 = require("./Features/ApplicationFeature/Commands/handlers/withdraw-application.handler");
const download_file_handler_1 = require("./Features/ApplicationFeature/Commands/handlers/download-file.handler");
const create_certification_handler_1 = require("./Features/CertificationFeature/Commands/handlers/create-certification.handler");
const delete_certification_handler_1 = require("./Features/CertificationFeature/Commands/handlers/delete-certification.handler");
const update_certification_handler_1 = require("./Features/CertificationFeature/Commands/handlers/update-certification.handler");
const delete_cover_letter_handler_1 = require("./Features/CoverLetterFeature/Commands/handlers/delete-cover-letter.handler");
const upload_cover_letter_handler_1 = require("./Features/CoverLetterFeature/Commands/handlers/upload-cover-letter.handler");
const delete_cv_handler_1 = require("./Features/CvFeature/Commands/handlers/delete-cv.handler");
const upload_cv_handler_1 = require("./Features/CvFeature/Commands/handlers/upload-cv.handler");
const create_education_handler_1 = require("./Features/EducationFeature/Commands/handlers/create-education.handler");
const update_education_handler_1 = require("./Features/EducationFeature/Commands/handlers/update-education.handler");
const delete_education_handler_1 = require("./Features/EducationFeature/Commands/handlers/delete-education.handler");
const create_experience_handler_1 = require("./Features/ExperienceFeature/Commands/handlers/create-experience.handler");
const update_experience_handler_1 = require("./Features/ExperienceFeature/Commands/handlers/update-experience.handler");
const delete_experience_handler_1 = require("./Features/ExperienceFeature/Commands/handlers/delete-experience.handler");
const create_project_handler_1 = require("./Features/ProjectFeature/Commands/handlers/create-project.handler");
const update_project_handler_1 = require("./Features/ProjectFeature/Commands/handlers/update-project.handler");
const delete_project_handler_1 = require("./Features/ProjectFeature/Commands/handlers/delete-project.handler");
const soft_delete_user_handler_1 = require("./Features/ProfileFeature/Commands/handlers/soft-delete-user.handler");
const update_student_profile_handler_1 = require("./Features/ProfileFeature/Commands/handlers/update-student-profile.handler");
const update_recruiter_profile_handler_1 = require("./Features/ProfileFeature/Commands/handlers/update-recruiter-profile.handler");
const assign_skill_handler_1 = require("./Features/SkillAssignmentFeature/Commands/handlers/assign-skill.handler");
const remove_skill_handler_1 = require("./Features/SkillAssignmentFeature/Commands/handlers/remove-skill.handler");
const update_skill_handler_1 = require("./Features/SkillAssignmentFeature/Commands/handlers/update-skill.handler");
const get_user_query_handler_1 = require("./Features/UserFeature/Queries/handlers/get-user-query.handler");
const get_users_query_handler_1 = require("./Features/UserFeature/Queries/handlers/get-users-query.handler");
const get_offer_query_handler_1 = require("./Features/OfferFeature/Queries/handlers/get-offer-query.handler");
const get_offers_query_handler_1 = require("./Features/OfferFeature/Queries/handlers/get-offers-query.handler");
const get_skill_query_handler_1 = require("./Features/SkillFeature/Queries/handlers/get-skill-query.handler");
const get_skills_query_handler_1 = require("./Features/SkillFeature/Queries/handlers/get-skills-query.handler");
const file_module_1 = require("../Infrastructure/storage/file.module");
const CommandHandlers = [
    login_handler_1.LoginHandler,
    register_student_handler_1.RegisterStudentHandler,
    register_recruiter_handler_1.RegisterRecruiterHandler,
    create_offer_handler_1.CreateOfferHandler,
    update_offer_handler_1.UpdateOfferHandler,
    delete_offer_handler_1.DeleteOfferHandler,
    apply_offer_handler_1.ApplyToOfferHandler,
    update_application_status_handler_1.UpdateApplicationStatusHandler,
    withdraw_application_handler_1.WithdrawApplicationHandler,
    download_file_handler_1.DownloadApplicationFileHandler,
    create_certification_handler_1.CreateCertificationHandler,
    update_certification_handler_1.UpdateCertificationHandler,
    delete_certification_handler_1.DeleteCertificationHandler,
    delete_cover_letter_handler_1.DeleteCoverLetterHandler,
    upload_cover_letter_handler_1.UploadCoverLetterHandler,
    delete_cv_handler_1.DeleteCVHandler,
    upload_cv_handler_1.UploadCVHandler,
    create_education_handler_1.CreateEducationHandler,
    update_education_handler_1.UpdateEducationHandler,
    delete_education_handler_1.DeleteEducationHandler,
    create_experience_handler_1.CreateExperienceHandler,
    update_experience_handler_1.UpdateExperienceHandler,
    delete_experience_handler_1.DeleteExperienceHandler,
    create_project_handler_1.CreateProjectHandler,
    update_project_handler_1.UpdateProjectHandler,
    delete_project_handler_1.DeleteProjectHandler,
    soft_delete_user_handler_1.SoftDeleteUserHandler,
    update_student_profile_handler_1.UpdateStudentProfileHandler,
    update_recruiter_profile_handler_1.UpdateRecruiterProfileHandler,
    assign_skill_handler_1.AssignSkillHandler,
    remove_skill_handler_1.RemoveSkillHandler,
    update_skill_handler_1.UpdateSkillHandler,
];
const QueryHandlers = [
    get_user_query_handler_1.GetUserQueryHandler,
    get_users_query_handler_1.GetUsersQueryHandler,
    get_offer_query_handler_1.GetOfferQueryHandler,
    get_offers_query_handler_1.GetOffersQueryHandler,
    get_skill_query_handler_1.GetSkillQueryHandler,
    get_skills_query_handler_1.GetSkillsQueryHandler,
];
let ApplicationModule = class ApplicationModule {
};
exports.ApplicationModule = ApplicationModule;
exports.ApplicationModule = ApplicationModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            config_1.ConfigModule,
            file_module_1.FileStorageModule,
            persistence_module_1.PersistenceModule,
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: Number(config.get('JWT_EXPIRATION_TIME') || 3600)
                    },
                }),
            }),
        ],
        providers: [
            ...CommandHandlers,
            ...QueryHandlers,
            jwt_strategy_1.JwtStrategy,
            {
                provide: AuthService_1.AuthService,
                useClass: jwt_auth_service_1.JwtAuthService,
            },
        ],
        exports: [
            cqrs_1.CqrsModule,
            jwt_1.JwtModule,
            passport_1.PassportModule,
            file_module_1.FileStorageModule,
        ],
    })
], ApplicationModule);
//# sourceMappingURL=Application.module.js.map