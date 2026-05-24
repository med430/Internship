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
exports.UserResolver = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const graphql_1 = require("@nestjs/graphql");
const get_users_query_1 = require("../../../Application/Features/UserFeature/Queries/get-users.query");
const get_user_query_1 = require("../../../Application/Features/UserFeature/Queries/get-user.query");
let UserResolver = class UserResolver {
    queryBus;
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    getUser(id) {
        return this.queryBus.execute(new get_user_query_1.GetUserQuery(id));
    }
    async getUsers(pageNumber, pageSize) {
        return await this.queryBus.execute(new get_users_query_1.GetUsersQuery(pageNumber, pageSize));
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, graphql_1.Query)('user'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "getUser", null);
__decorate([
    (0, graphql_1.Query)('users'),
    __param(0, (0, graphql_1.Args)('pageNumber')),
    __param(1, (0, graphql_1.Args)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUsers", null);
exports.UserResolver = UserResolver = __decorate([
    (0, graphql_1.Resolver)('User'),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], UserResolver);
//# sourceMappingURL=user.resolver.js.map