# AI Interviewer

An AI-powered mock interview platform that helps users practice and improve their interview skills through realistic role-based questions and personalized feedback.

## Features

### Interview Practice
- Conduct mock interviews with role-specific questions
- Voice recording for natural interview simulation
- Real-time audio transcription using speech-to-text
- Interactive orb visualization that responds during recording

### Question Management
- Browse comprehensive question bank across multiple roles
- Filter questions by job role (Product Manager, Software Engineer, Data Scientist, etc.)
- Search questions by company, role, or content
- Start interviews with specific questions directly from the question bank

### Feedback & Analytics
- Detailed performance evaluation across multiple criteria
- Color-coded scoring system (red for poor, yellow for average, green for good)
- Personalized recommendations for improvement
- Positive feedback highlights and actionable improvement suggestions
- Overall score breakdown with visual progress indicators

### Chat Management
- Persistent interview history with all sessions saved
- Delete individual chat sessions with one-click removal
- Organized sidebar with recent interviews
- Direct navigation to feedback from any completed interview

### Authentication
- Secure user authentication with Supabase
- Protected routes requiring sign-in
- Session management across all pages
- Server-side authentication checks

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Audio Processing**: Web Speech API for voice recording
- **State Management**: React hooks and context

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the application.

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - Reusable UI components
- `lib/` - Utility functions, API helpers, and database operations
- `hooks/` - Custom React hooks for voice recording and authentication

## Usage

1. Sign in to access the platform
2. Start a new interview from the home page or browse questions
3. Record your voice responses to interview questions
4. Receive detailed feedback and performance scores
5. Review recommendations and track improvement over time
