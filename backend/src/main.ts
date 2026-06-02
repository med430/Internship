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

  // CORS origins:
  //  - localhost (any port) for local dev
  //  - any *.vercel.app deployment (production alias AND per-deploy preview URLs,
  //    which have a unique hash like project-xxxx-<hash>-<team>.vercel.app)
  //  - any extra exact origins listed in CORS_ORIGIN (comma-separated)
  const allowedOrigins: (string | RegExp)[] = [
    /^http:\/\/localhost:\d+$/,
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  ];
  if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map((o) => o.trim()));
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
