# Time Clipper

## Project Overview

This is a Next.js application for easy schedule coordination, featuring Google OAuth authentication and Google Calendar integration for anyone with a Google account.

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js v4.24.11
- **Icons**: Lucide React
- **Calendar Integration**: Google APIs (googleapis v150.0.1)

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main page (renders Scheduler)
└── components/
    └── Scheduler.tsx       # Main scheduler component
```

## Key Features

- Google OAuth authentication (open to all Google accounts)
- Theme switching (light/dark/system)
- Schedule search with customizable parameters
- Export functionality for schedule results
- Mobile-responsive design

## Environment Setup

Required environment variables:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Development Notes

- Uses 'use client' directive for interactive components
- TypeScript strict mode enabled
- Tailwind CSS configured with custom gradients
- Google Calendar API integration ready for implementation
