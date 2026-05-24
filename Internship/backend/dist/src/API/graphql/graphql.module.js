"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLAPIModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const cqrs_1 = require("@nestjs/cqrs");
const Application_module_1 = require("../../Application/Application.module");
const user_resolver_1 = require("./resolvers/user.resolver");
const offer_resolver_1 = require("./resolvers/offer.resolver");
const skill_resolver_1 = require("./resolvers/skill.resolver");
let GraphQLAPIModule = class GraphQLAPIModule {
};
exports.GraphQLAPIModule = GraphQLAPIModule;
exports.GraphQLAPIModule = GraphQLAPIModule = __decorate([
    (0, common_1.Module)({
        imports: [
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                typePaths: [(0, path_1.join)(process.cwd(), 'src/API/graphql/schema/*.graphql')],
                playground: true,
            }),
            cqrs_1.CqrsModule,
            Application_module_1.ApplicationModule,
        ],
        providers: [
            user_resolver_1.UserResolver,
            offer_resolver_1.OfferResolver,
            skill_resolver_1.SkillResolver,
        ],
    })
], GraphQLAPIModule);
//# sourceMappingURL=graphql.module.js.map