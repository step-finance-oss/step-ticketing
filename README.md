# Step Ticketing

Step Finance used this application for ticket sales and guest check-in at **Solana Crossroads 2025 in Istanbul**. It is available under the [MIT license](LICENSE.md) as a working reference for developers. **The project is not actively maintained.** The local example uses Solana devnet and a sample event with dates relative to the day you seed it.

The app accepts USDC through a wallet or a Solana Action (Blink). It records the purchase and ticket in PostgreSQL, emails the attendee a QR code, and gives event staff a guest list and check-in screen. The repository also includes the event's pricing tiers, time-based prices, promo codes, and merchandise options.

## Run the reference locally

You need Node.js 24, the pnpm version in `package.json`, and Docker Compose. Run these commands from the repository root.

1. Start PostgreSQL and the local mail inbox, and copy the example configuration.

   ```sh
   docker compose up -d --wait postgres mailhog
   cp .env.example .env
   ```

2. In `.env`, set `NEXTAUTH_SECRET` and `FIRST_ADMIN_SETUP_TOKEN` to separate random values. Generate each with `openssl rand -hex 32`. For wallet checkout, also set `NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY` to a devnet wallet with an initialized USDC token account.

3. Install dependencies, apply migrations to the empty local database, and load the sample event once.

   ```sh
   pnpm install --frozen-lockfile
   pnpm exec prisma generate
   pnpm exec prisma migrate deploy
   docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -1 -U ticketing -d ticketing < initial_seed.sql
   ```

4. Start the app with `pnpm dev:only`. In a second terminal, run `pnpm inngest` for confirmation emails and delayed payment checks.

5. Open [the sample event](http://localhost:3000). At [first admin setup](http://localhost:3000/create-first-user), enter your setup token and create an administrator. Remove the setup token from `.env` and restart the app after creating the account.

## Try the event workflow

- **Admission without a wallet.** In [the admin panel](http://localhost:3000/admin), open **Tickets**, select the demo event and add a guest ticket. Enter `{}` for an empty merchandise selection. Open **Guests**, select the event, look up the guest by name or email and check them in. A staff account can perform check-in and update merchandise selections.
- **Wallet checkout.** Use a separate devnet buyer wallet funded with [devnet SOL](https://faucet.solana.com/) for fees and [test USDC](https://faucet.circle.com/) for the ticket. Buy a tier from the sample event and open [the local inbox](http://localhost:8025) to find the QR confirmation. The receiving wallet, mint and buyer wallet must all use the same network.
- **Blinks.** The app exposes its Solana Action routes through [actions.json](http://localhost:3000/actions.json). Each published event has a route for browsing tiers and initiating a purchase.
- **Historical integrations.** The Kado fiat on-ramp code is preserved for reference. It is disabled by default, and its hosted payment flow has not been revalidated.

## Code guide

| Workflow | Source |
| --- | --- |
| Purchase quote, transfer verification and fulfillment | [Purchases](lib/purchase/server.ts) and [Solana helpers](lib/solana-utils.ts) |
| Email delivery, resend and delayed confirmation | [Background jobs](lib/inngest/functions.ts) |
| Guest lookup and check-in | [Guest screens](app/admin/p) and [ticket operations](lib/ticket/server.ts) |
| Event, price tier, purchase and ticket records | [Database schema](prisma/schema.prisma) |

Run `pnpm test --run` for the unit suite and `pnpm type-check` for TypeScript. With the disposable local database running, `pnpm build` also applies pending migrations before building the app. Anyone operating a fork takes responsibility for dependency updates, payment integrations, and attendee data.
