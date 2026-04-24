import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: './src/Infrastructure/Persistence/prisma/schema.prisma',
    migrations: {
        path: './src/Infrastructure/Persistence/prisma/migrations',
    },
    datasource: {
        url: "postgres://postgres:Abc123987456@localhost:5432/Internship",
    },
});