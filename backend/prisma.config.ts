import { defineConfig } from '@prisma/config';
import * as dotenv from "dotenv";
import { existsSync } from 'fs';
import { resolve } from 'path';

const envPathCandidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '..', '.env'),
    resolve(__dirname, '..', '.env'),
]

dotenv.config({
    path: envPathCandidates.find((candidate) => existsSync(candidate)) || envPathCandidates[0],
});

const url = process.env.DB_URL;

export default defineConfig({
    schema: './src/Infrastructure/Persistence/prisma/schema.prisma',
    migrations: {
        path: './src/Infrastructure/Persistence/prisma/migrations',
    },
    datasource: {
        url: url,
    },
});
