import { Module } from '@nestjs/common';
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from 'path';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationModule } from '../../Application/Application.module';
import { UserResolver } from './resolvers/user.resolver';
import { OfferResolver } from './resolvers/offer.resolver';
import { SkillResolver } from './resolvers/skill.resolver';
import { CVResolver } from './resolvers/cv.resolver';
import { EducationResolver } from './resolvers/education.resolver';
import { ProjectResolver } from './resolvers/project.resolver';
import { SkillAssignmentResolver } from './resolvers/skill-assignment.resolver';
import { RecommendationResolver } from './resolvers/recommendation.resolver';
import { InterviewResolver } from './resolvers/interview.resolver';
import { ApplicationResolver } from './resolvers/application.resolver';
import { StudentProfileResolver } from './resolvers/student-profile.resolver';
import { RecruiterProfileResolver } from './resolvers/recruiter-profile.resolver';
import { CoverletterResolver } from './resolvers/coverletter.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [join(process.cwd(), 'src/API/graphql/schema/*.graphql')],
      playground: true,
    }),
    CqrsModule,
    ApplicationModule,
  ],
  providers: [
    UserResolver,
    OfferResolver,
    SkillResolver,
    CVResolver,
    EducationResolver,
    ProjectResolver,
    SkillAssignmentResolver,
    RecommendationResolver,
    InterviewResolver,
    ApplicationResolver,
    StudentProfileResolver,
    RecruiterProfileResolver,
    CoverletterResolver,
  ],
})
export class GraphQLAPIModule {}