import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {HttpApiModule} from "./API/http/http.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import { ConfigModule } from '@nestjs/config';
import { GraphQLAPIModule } from './API/graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpApiModule,
    GraphQLAPIModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
