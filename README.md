# Gym Flow Tracker

Mobile-first workout tracking app built with Next.js + TypeScript.

## Features

- Dynamic exercise tracking with machine specifications
- Calendar logging for exercise sessions and reps
- Manual cross-device sync using Vercel Blob
- Last-Write-Wins conflict resolution (`updatedAt` timestamp)
- Dark and light mode with custom UI theme
- JSON export/import backups

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env.local
   ```
3. Add your token in `.env.local`:
   ```env
   BLOB_READ_WRITE_TOKEN=your_token_here
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```

## Vercel

- Add `BLOB_READ_WRITE_TOKEN` in Vercel project environment variables.
- Deploy normally with Vercel.
- Sync endpoints use `app/api/sync/pull` and `app/api/sync/push`.
