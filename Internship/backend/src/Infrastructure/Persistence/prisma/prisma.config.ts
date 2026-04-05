import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: './schema.prisma',
    migrations: {
        path: './migrations',
    },
    datasource: {
        url: "postgres://postgres:Abc123987456@localhost:5432/Internship",
    },
});