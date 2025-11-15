# DataStory AI

> Transform your data into compelling stories with AI-powered insights and interactive visualizations.

[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)

## 🚀 Overview

DataStory AI is an AI-native data storytelling platform that automatically transforms raw datasets into compelling narratives with interactive visualizations. Unlike traditional BI tools that require manual configuration and technical expertise, DataStory AI provides fully automated end-to-end analysis—from data upload to narrative generation to interactive visualizations—with zero manual configuration.

**Perfect for:**
- Business analysts who need quick insights
- Marketing teams analyzing campaign data
- Sales teams tracking performance
- Executives reviewing metrics
- Anyone who wants to understand their data without technical skills

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
- **GitHub Actions** for CI/CD

Code is automatically linted and formatted on commit.

### CI/CD Pipeline

The project includes automated CI/CD pipelines:

- **Continuous Integration**: Runs on every pull request
  - Linting (ESLint, Prettier, Black, Flake8)
  - Unit tests (Jest, pytest)
  - Build verification
  
- **Staging Deployment**: Automatic deployment to staging on merge to `develop`
- **Production Deployment**: Automatic deployment to production on merge to `main`

For detailed CI/CD documentation, see:
- [CI/CD Implementation Guide](docs/ci-cd-implementation.md)
- [Workflow Documentation](.github/workflows/README.md)
- [Contributing Guide](.github/CONTRIBUTING.md)

## ✨ Features

### Core Functionality
- 🔐 **Secure Authentication** - User registration, login, and session management
- 📤 **Easy Upload** - Drag-and-drop CSV/Excel files (up to 1,000 rows on free tier)
- 📊 **Automated Analysis** - Statistical analysis with trend detection, correlations, and distributions
- 🤖 **AI Narratives** - Google Gemini-powered narrative generation in business language
- 📈 **Smart Visualizations** - Automatic chart selection (line, bar, scatter, pie)
- 📖 **Scrollytelling** - Interactive story experience with animated charts
- 💾 **Story Management** - Save, view, and delete your data stories
- 📄 **PDF Export** - Professional PDF reports with high-resolution charts
- 🎯 **Tier Management** - Free tier with 3 stories/month, upgrade options

### Technical Features
- ⚡ **Fast Performance** - < 60 second story generation, < 3 second page loads
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🔒 **Enterprise Security** - TLS encryption, secure storage, data isolation
- 🌐 **Cross-Browser** - Chrome, Firefox, Safari, Edge support
- 📊 **Real-time Progress** - Live updates during story generation
- 🎨 **Modern UI** - Clean, intuitive interface with TailwindCSS

## 📚 Documentation

- **[Getting Started Guide](docs/GETTING_STARTED.md)** - Create your first story in 5 minutes
- **[User Guide](docs/USER_GUIDE.md)** - Complete user documentation
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Performance Guide](docs/performance-optimization.md)** - Optimization best practices
- **[Security Guide](docs/security-implementation.md)** - Security implementation details
- **[CI/CD Guide](docs/ci-cd-implementation.md)** - Continuous integration setup

## 🎯 Quick Start

### For Users

1. **Sign up** at [datastory.ai](https://datastory.ai)
2. **Upload** your CSV or Excel file
3. **Wait** 30-60 seconds for analysis
4. **Explore** your interactive data story
5. **Export** as PDF to share

[Download sample datasets](public/sample-datasets/) to try it out!

### For Developers

```bash
# Clone the repository
git clone https://github.com/yourusername/datastory-ai.git
cd datastory-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

See [Development Setup](#development-setup) for detailed instructions.

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js App   │  ← Frontend + API Routes
│   (Vercel)      │
└────────┬────────┘
         │
         ├─────────────┐
         │             │
    ┌────▼────┐   ┌───▼────────┐
    │ MongoDB │   │   Python   │  ← Analysis Service
    │  Atlas  │   │   FastAPI  │
    └─────────┘   └────┬───────┘
                       │
                  ┌────▼────────┐
                  │   Gemini    │  ← AI Narratives
                  │     AI      │
                  └─────────────┘
```

### Technology Stack

**Frontend**
- Next.js 16 with React 19
- TypeScript for type safety
- TailwindCSS for styling
- Recharts for visualizations

**Backend**
- Next.js API Routes
- MongoDB Atlas for data storage
- Cloudinary for file storage
- JWT authentication

**Analysis Service**
- Python FastAPI
- pandas for data processing
- scikit-learn for statistics
- Google Gemini AI for narratives

**Infrastructure**
- Vercel for hosting
- MongoDB Atlas for database
- Cloudinary for file storage
- GitHub Actions for CI/CD

## 🛠️ Development Setup

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API key

### Environment Variables

Create `.env.local` with:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your-secret-key

# Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Service
GEMINI_API_KEY=your-gemini-key
PYTHON_SERVICE_URL=http://localhost:8000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running Locally

```bash
# Install dependencies
npm install

# Run database migrations (create indexes)
npm run create-indexes

# Start development server
npm run dev

# In another terminal, start Python service
cd python-service
pip install -r requirements.txt
uvicorn main:app --reload
```

### Running Tests

```bash
# Run all tests
npm test

# Run end-to-end tests
npm run test:e2e

# Run with coverage
npm test -- --coverage

# Python tests
cd python-service
pytest
```

## 📊 Sample Datasets

Try DataStory AI with our sample datasets:

1. **[Sales Data](public/sample-datasets/sales-data.csv)** - Monthly sales by region and product
2. **[Customer Analytics](public/sample-datasets/customer-analytics.csv)** - Customer segments and satisfaction
3. **[Marketing Campaign](public/sample-datasets/marketing-campaign.csv)** - Campaign performance metrics

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

See [Deployment Guide](DEPLOYMENT.md) for detailed instructions.

### Environment Setup

1. Configure environment variables in Vercel dashboard
2. Set up MongoDB Atlas connection
3. Configure Cloudinary storage
4. Add Gemini API key
5. Deploy Python service

## 🧪 Testing

### Manual Testing

Use the [E2E Testing Checklist](docs/e2e-testing-checklist.md) for comprehensive manual testing.

### Automated Testing

```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e

# Performance audit
npm run audit:performance
```

## 📈 Performance

- **Initial Load**: < 3 seconds (4G)
- **Story Generation**: < 60 seconds (1000 rows)
- **PDF Export**: < 10 seconds
- **Lighthouse Score**: > 85

See [Performance Guide](docs/performance-optimization.md) for optimization details.

## 🔒 Security

- TLS 1.3 encryption for all connections
- AES-256 encryption for stored data
- JWT-based authentication
- Rate limiting and CSRF protection
- Input validation and sanitization
- Regular security audits

See [Security Guide](docs/security-implementation.md) for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](.github/CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Quality

- ESLint for code linting
- Prettier for formatting
- TypeScript for type safety
- Jest for testing
- Husky for pre-commit hooks

## 📝 License

Private - All rights reserved

## 🆘 Support

- **Email**: support@datastory.ai
- **Documentation**: [docs.datastory.ai](https://docs.datastory.ai)
- **Community**: [community.datastory.ai](https://community.datastory.ai)

## 🗺️ Roadmap

### Phase 1 (MVP) ✅
- User authentication
- File upload and processing
- Automated analysis
- AI narrative generation
- Interactive visualizations
- PDF export

### Phase 2 (Coming Soon)
- Story editing and customization
- Team collaboration
- Advanced chart types
- API access
- Scheduled reports

### Phase 3 (Future)
- Real-time data connections
- Custom branding
- White-label options
- Advanced analytics
- Machine learning insights

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI narratives
- [Recharts](https://recharts.org/) - Visualizations
- [TailwindCSS](https://tailwindcss.com/) - Styling

---

**Made with ❤️ by the DataStory AI team**

[Website](https://datastory.ai) • [Documentation](https://docs.datastory.ai) • [Blog](https://blog.datastory.ai)
