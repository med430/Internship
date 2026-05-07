import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import * as dotenv from "dotenv";
import * as express from 'express'
import { existsSync } from 'fs';
import { resolve } from 'path';

const envPathCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '.env'),
];

dotenv.config({
  path: envPathCandidates.find((candidate) => existsSync(candidate)) ?? envPathCandidates[0],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
