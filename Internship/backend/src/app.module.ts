import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {HttpApiModule} from "./API/http/http.module";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  imports: [
      HttpApiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
