import { defineConfig } from '@prisma/config';
import * as dotenv from "dotenv";

dotenv.config();

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