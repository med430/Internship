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
exports.SkillResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const get_skills_query_1 = require("../../../Application/Features/SkillFeature/Queries/get-skills.query");
const get_skill_query_1 = require("../../../Application/Features/SkillFeature/Queries/get-skill.query");
const cqrs_1 = require("@nestjs/cqrs");
let SkillResolver = class SkillResolver {
    queryBus;
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async getSkills(pageNumber, pageSize) {
        return this.queryBus.execute(new get_skills_query_1.GetSkillsQuery(pageNumber, pageSize));
    }
    async getSkill(id) {
        return this.queryBus.execute(new get_skill_query_1.GetSkillQuery(id));
    }
};
exports.SkillResolver = SkillResolver;
__decorate([
    (0, graphql_1.Query)('skills'),
    __param(0, (0, graphql_1.Args)('pageNumber')),
    __param(1, (0, graphql_1.Args)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SkillResolver.prototype, "getSkills", null);
__decorate([
    (0, graphql_1.Query)('skill'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SkillResolver.prototype, "getSkill", null);
exports.SkillResolver = SkillResolver = __decorate([
    (0, graphql_1.Resolver)('Skill'),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], SkillResolver);
//# sourceMappingURL=skill.resolver.js.map