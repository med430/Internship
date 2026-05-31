import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import * as express from 'express'
import { existsSync } from 'fs';
import { resolve } from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';

const envPathCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '.env'),
];

dotenv.config({
  path: envPathCandidates.find((candidate) => existsSync(candidate)) ?? envPathCandidates[0],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [/^http:\/\/localhost:\d+$/];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
