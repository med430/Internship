"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStudentProfilesQueryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const get_student_profiles_query_1 = require("../get-student-profiles.query");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
let GetStudentProfilesQueryHandler = class GetStudentProfilesQueryHandler {
    studentProfileRepository;
    constructor(studentProfileRepository) {
        this.studentProfileRepository = studentProfileRepository;
    }
    async execute(query) {
        return this.studentProfileRepository.findPaginated(query.pageNumber, query.pageSize);
    }
};
exports.GetStudentProfilesQueryHandler = GetStudentProfilesQueryHandler;
exports.GetStudentProfilesQueryHandler = GetStudentProfilesQueryHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_student_profiles_query_1.GetStudentProfilesQuery),
    __metadata("design:paramtypes", [Object])
], GetStudentProfilesQueryHandler);
//# sourceMappingURL=get-student-profiles-query.handler.js.map