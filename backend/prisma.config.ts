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

// DB_URL      = pooled connection (PgBouncer) — used by the app at runtime
// DIRECT_URL  = direct connection (no pooler) — required for migrations (advisory locks)
const url       = process.env.DIRECT_URL ?? process.env.DB_URL;
const runtimeUrl = process.env.DB_URL;

export default defineConfig({
    schema: './src/Infrastructure/Persistence/prisma/schema.prisma',
    migrations: {
        path: './src/Infrastructure/Persistence/prisma/migrations',
    },
    datasource: {
        url: url,
        // directUrl keeps the Prisma client using the pooled URL at runtime
        // while migrations go through the direct connection
        ...(runtimeUrl && url !== runtimeUrl ? { directUrl: runtimeUrl } : {}),
    },
});
