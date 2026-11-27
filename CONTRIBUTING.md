# Working on a fork

Step Ticketing is an unmaintained reference from Solana Crossroads 2025. There is no regular pull request review or release schedule.

Follow the [local setup](README.md#run-the-reference-locally) to generate the Prisma client and prepare a development database. Use `pnpm lint`, `pnpm type-check`, and `pnpm test --run` to check a change. Tests use Vitest and mocked Prisma calls. When changing the schema, generate a migration with `pnpm exec prisma migrate dev` and include it alongside the schema change.
