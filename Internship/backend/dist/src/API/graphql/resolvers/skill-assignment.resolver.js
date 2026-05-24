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
const skill_assignment_entity_1 = require("../../../Domain/entities/skill-assignment.entity");
const cqrs_1 = require("@nestjs/cqrs");
const get_skill_assignments_query_1 = require("../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignments.query");
const get_skill_assignment_query_1 = require("../../../Application/Features/SkillAssignmentFeature/Queries/get-skill-assignment.query");
let SkillAssignmentResolver = class SkillAssignmentResolver {
    queryBus;
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async getSkillAssignment(id) {
        return this.queryBus.execute(new get_skill_assignment_query_1.GetSkillAssignmentQuery(id));
    }
    async getSkillAssignments(pageNumber, pageSize) {
        return this.queryBus.execute(new get_skill_assignments_query_1.GetSkillAssignmentsQuery(pageNumber, pageSize));
    }
};
exports.SkillAssignmentResolver = SkillAssignmentResolver;
__decorate([
    (0, graphql_1.Query)('skillAssignment'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SkillAssignmentResolver.prototype, "getSkillAssignment", null);
__decorate([
    (0, graphql_1.Query)('skillAssignments'),
    __param(0, (0, graphql_1.Args)('pageNumber')),
    __param(1, (0, graphql_1.Args)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SkillAssignmentResolver.prototype, "getSkillAssignments", null);
exports.SkillAssignmentResolver = SkillAssignmentResolver = __decorate([
    (0, graphql_1.Resolver)(skill_assignment_entity_1.SkillAssignment),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], SkillAssignmentResolver);
//# sourceMappingURL=skill-assignment.resolver.js.map