import { Module } from '@nestjs/common';
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from 'path';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationModule } from '../../Application/Application.module';
import { UserResolver } from './resolvers/user.resolver';
import { OfferResolver } from './resolvers/offer.resolver';

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
  ],
})
export class GraphQLAPIModule {}