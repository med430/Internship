import { Module } from '@nestjs/common';
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from 'path';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationModule } from '../../Application/Application.module';

import { GqlAuthGuard } from './guards/gql-auth.guard';
import { GqlRolesGuard } from './guards/gql-roles.guard';

import { UserResolver } from './resolvers/user.resolver';
import { OfferResolver } from './resolvers/offer.resolver';
import { SkillResolver } from './resolvers/skill.resolver';
import { CVResolver } from './resolvers/cv.resolver';
import { EducationResolver } from './resolvers/education.resolver';
import { ExperienceResolver } from './resolvers/experience.resolver';
import { ProjectResolver } from './resolvers/project.resolver';
import { CertificationResolver } from './resolvers/certification.resolver';
import { CoverletterResolver } from './resolvers/coverletter.resolver';
import { SkillAssignmentResolver } from './resolvers/skill-assignment.resolver';
import { ApplicationResolver } from './resolvers/application.resolver';
import { InterviewResolver } from './resolvers/interview.resolver';
import { RecommendationResolver } from './resolvers/recommendation.resolver';
import { StudentProfileResolver } from './resolvers/student-profile.resolver';
import { RecruiterProfileResolver } from './resolvers/recruiter-profile.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [join(process.cwd(), 'src/API/graphql/schema/*.graphql')],
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    CqrsModule,
    ApplicationModule,
  ],
  providers: [
    GqlAuthGuard,
    GqlRolesGuard,
    UserResolver,
    OfferResolver,
    SkillResolver,
    CVResolver,
    EducationResolver,
    ExperienceResolver,
    ProjectResolver,
    CertificationResolver,
    CoverletterResolver,
    SkillAssignmentResolver,
    ApplicationResolver,
    InterviewResolver,
    RecommendationResolver,
    StudentProfileResolver,
    RecruiterProfileResolver,
  ],
})
export class GraphQLAPIModule {}