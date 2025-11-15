# DataStory AI MVP

An AI-native data storytelling platform that automatically transforms raw datasets into compelling narratives with interactive visualizations.

## Overview

DataStory AI provides fully automated end-to-end analysis—from data upload to narrative generation to interactive visualizations—with zero manual configuration. The platform targets non-technical business stakeholders who need data insights but lack the skills to use complex BI tools.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB Atlas
- **Storage**: AWS S3
- **AI**: OpenAI GPT-4
- **Analysis**: Python FastAPI microservice

## Project Structure

```
.
├── app/              # Next.js app directory (pages, layouts, routes)
├── components/       # React components
├── lib/              # Utility functions and shared logic
├── types/            # TypeScript type definitions
├── public/           # Static assets
└── .kiro/            # Kiro specs and configuration
```

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- MongoDB Atlas account
- AWS account (for S3)
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables template:

```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Development Workflow

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks

Code is automatically linted and formatted on commit.

## Features (MVP Scope)

- User authentication and account management
- CSV/Excel file upload (up to 1000 rows for free tier)
- Automated statistical analysis
- AI-powered narrative generation
- Automated visualization selection
- Interactive scrollytelling interface
- Story management and persistence
- PDF export functionality
- Free tier usage limits

## License

Private - All rights reserved
