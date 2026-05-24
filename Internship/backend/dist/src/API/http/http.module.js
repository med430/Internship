"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpApiModule = void 0;
const common_1 = require("@nestjs/common");
const Application_module_1 = require("../../Application/Application.module");
const auth_controller_1 = require("./auth/auth.controller");
const offer_controller_1 = require("./offer/offer.controller");
const application_controller_1 = require("./application/application.controller");
const education_controller_1 = require("./education/education.controller");
const project_controller_1 = require("./project/project.controller");
const certification_controller_1 = require("./certification/certification.controller");
const cover_letter_controller_1 = require("./coverLetter/cover-letter.controller");
const cv_controller_1 = require("./cv/cv.controller");
const experience_controller_1 = require("./experience/experience.controller");
const profile_controller_1 = require("./profile/profile.controller");
const skill_controller_1 = require("./skillAssignment/skill.controller");
let HttpApiModule = class HttpApiModule {
};
exports.HttpApiModule = HttpApiModule;
exports.HttpApiModule = HttpApiModule = __decorate([
    (0, common_1.Module)({
        imports: [Application_module_1.ApplicationModule],
        controllers: [auth_controller_1.AuthController, offer_controller_1.OfferController, application_controller_1.ApplicationController,
            education_controller_1.EducationController,
            project_controller_1.ProjectController,
            certification_controller_1.CertificationController,
            cover_letter_controller_1.CoverLetterController,
            cv_controller_1.CVController,
            experience_controller_1.ExperienceController,
            profile_controller_1.ProfileController,
            skill_controller_1.SkillAssignmentController]
    })
], HttpApiModule);
//# sourceMappingURL=http.module.js.map