import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {HttpApiModule} from "./API/http/http.module";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'Abc123987456',
        database: 'trading',
        autoLoadEntities: false,
        synchronize: true
      }),
      HttpApiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
