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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillAssignmentResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const cqrs_1 = require("@nestjs/cqrs");
const student_profile_entity_1 = require("../../../Domain/entities/student-profile.entity");
const get_student_profile_query_1 = require("../../../Application/Features/StudentProfileFeature/Queries/get-student-profile.query");
const get_student_profiles_query_1 = require("../../../Application/Features/StudentProfileFeature/Queries/get-student-profiles.query");
let SkillAssignmentResolver = class SkillAssignmentResolver {
    queryBus;
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async getStudentProfile(id) {
        return this.queryBus.execute(new get_student_profile_query_1.GetStudentProfileQuery(id));
    }
    async getStudentProfiles(pageNumber, pageSize) {
        return this.queryBus.execute(new get_student_profiles_query_1.GetStudentProfilesQuery(pageNumber, pageSize));
    }
};
exports.SkillAssignmentResolver = SkillAssignmentResolver;
__decorate([
    (0, graphql_1.Query)('studentProfile'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SkillAssignmentResolver.prototype, "getStudentProfile", null);
__decorate([
    (0, graphql_1.Query)('studentProfiles'),
    __param(0, (0, graphql_1.Args)('pageNumber')),
    __param(1, (0, graphql_1.Args)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SkillAssignmentResolver.prototype, "getStudentProfiles", null);
exports.SkillAssignmentResolver = SkillAssignmentResolver = __decorate([
    (0, graphql_1.Resolver)(student_profile_entity_1.StudentProfile),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], SkillAssignmentResolver);
//# sourceMappingURL=student-profile.resolver.js.map