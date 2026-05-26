import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {HttpApiModule} from "./API/http/http.module";
import { ConfigModule } from '@nestjs/config';
import { GraphQLAPIModule } from './API/graphql/graphql.module';
import { resolve } from 'path';
import { SupabaseSyncMiddleware } from './API/http/middleware/supabase-sync.middleware';
import { CallGateway } from './API/websocket/gateways/call.gateway';

const envFilePaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '.env'),
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths,
    }),
    HttpApiModule,
    GraphQLAPIModule,
  ],
  controllers: [AppController],
  providers: [AppService, CallGateway],
})
export class AppModule implements NestModule {
  // Auto-syncs any Supabase-authenticated request to a NeonDB User row. Runs before every route, never blocks.
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SupabaseSyncMiddleware).forRoutes('*')
  }
}
