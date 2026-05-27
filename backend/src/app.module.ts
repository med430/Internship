import { MiddlewareConsumer, Module, NestModule, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {HttpApiModule} from "./API/http/http.module";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLAPIModule } from './API/graphql/graphql.module';
import { resolve } from 'path';
import { existsSync } from 'fs';
import * as dotenv from 'dotenv';
import { SupabaseSyncMiddleware } from './API/http/middleware/supabase-sync.middleware';
import { CallGateway } from './API/websocket/gateways/call.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './API/websocket/gateways/chat.gateway';
import { ChatPersistenceModule } from './Infrastructure/chat/chat-persistence.module';

const envFilePaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '.env'),
];

// Populate process.env early so the chat feature flag can drive module wiring below.
dotenv.config({ path: envFilePaths.find(p => existsSync(p)) ?? envFilePaths[0] });

const chatEnabled = !!process.env.CHAT_DB_URL;
if (!chatEnabled) {
  new Logger('AppModule').warn('CHAT_DB_URL not set — chat feature disabled');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths,
    }),
    ScheduleModule.forRoot(),
    ...(chatEnabled ? [
      MongooseModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          uri: config.get<string>('CHAT_DB_URL'),
        }),
      }),
      ChatPersistenceModule,
    ] : []),
    HttpApiModule,
    GraphQLAPIModule,
  ],
  controllers: [AppController],
  providers: [AppService, CallGateway, ...(chatEnabled ? [ChatGateway] : [])],
})
export class AppModule implements NestModule {
  // Auto-syncs any Supabase-authenticated request to a NeonDB User row. Runs before every route, never blocks.
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SupabaseSyncMiddleware).forRoutes('*')
  }
}
