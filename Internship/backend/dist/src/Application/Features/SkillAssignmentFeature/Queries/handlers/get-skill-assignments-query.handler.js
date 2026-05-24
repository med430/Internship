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
exports.GetSkillAssignmentsQueryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const get_skill_assignments_query_1 = require("../get-skill-assignments.query");
const skill_assignment_repository_1 = require("../../../../repositories/skill-assignment.repository");
let GetSkillAssignmentsQueryHandler = class GetSkillAssignmentsQueryHandler {
    skillAssignmentRepository;
    constructor(skillAssignmentRepository) {
        this.skillAssignmentRepository = skillAssignmentRepository;
    }
    async execute(query) {
        return this.skillAssignmentRepository.findPaginated(query.pageNumber, query.pageSize);
    }
};
exports.GetSkillAssignmentsQueryHandler = GetSkillAssignmentsQueryHandler;
exports.GetSkillAssignmentsQueryHandler = GetSkillAssignmentsQueryHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_skill_assignments_query_1.GetSkillAssignmentsQuery),
    __metadata("design:paramtypes", [Object])
], GetSkillAssignmentsQueryHandler);
//# sourceMappingURL=get-skill-assignments-query.handler.js.map