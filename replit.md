# LinkedIn API Integration Tool

## Overview

This is a professional LinkedIn API integration tool built with a React frontend and Express backend. The application provides legitimate access to LinkedIn profile data through official APIs, featuring an Azure Portal-inspired design. Users can upload Excel files containing LinkedIn URLs, authenticate with LinkedIn OAuth, and extract profile data in batches with comprehensive progress tracking and error handling.

## Recent Changes

- ✓ Implemented Azure Portal-inspired design with professional color scheme
- ✓ Added functional authentication system with LinkedIn OAuth integration
- ✓ Created working file upload system with Excel processing
- ✓ Built real-time job processing with progress tracking
- ✓ Added comprehensive statistics dashboard
- ✓ Implemented export functionality for results
- ✓ Added demo data for immediate functionality testing
- ✓ Integrated PostgreSQL database with Drizzle ORM (July 17, 2025)
- ✓ Migrated from in-memory storage to persistent database storage
- ✓ Created sample data in database with 32 total profiles across multiple jobs
- ✓ Completed systematic architecture improvements across 5 phases (July 20, 2025):
  - Phase 1: Fixed TypeScript/LSP errors, extracted business logic to services
  - Phase 2: Implemented dependency injection, split Excel processor into parser/exporter
  - Phase 3: Added error boundaries, created custom hooks for file upload and job processing
  - Centralized configuration management with constants
  - Added custom error types for better error handling

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom Azure Portal-inspired color scheme
- **Build Tool**: Vite for fast development and optimized builds
- **Error Handling**: React error boundaries for graceful error recovery
- **Custom Hooks**: Specialized hooks for file upload and job processing logic

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **File Processing**: Multer for file uploads, xlsx library for Excel parsing (split into parser/exporter services)
- **Authentication**: LinkedIn OAuth integration
- **Job Processing**: Custom queue system with dependency injection for batch profile extraction
- **Service Architecture**: Dependency injection container for decoupled services
- **Error Handling**: Custom error types with proper error categorization

### Data Storage Solutions
- **Primary Database**: PostgreSQL with persistent storage (fully operational)
- **ORM**: Drizzle with schema-first approach and automatic migrations
- **File Storage**: Local filesystem for uploaded files and results
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Sample Data**: 32 LinkedIn profiles across 3 completed jobs with 75% success rate

## Key Components

### Database Schema
- **Users**: Authentication and LinkedIn token storage
- **Jobs**: Batch processing job tracking with status and progress
- **Profiles**: Individual LinkedIn profile extraction records
- **API Stats**: Rate limiting and usage tracking

### Service Architecture
- **ExcelParser**: Handles Excel file parsing and LinkedIn URL extraction
- **ExcelExporter**: Manages result export and Excel file generation
- **JobSimulator**: Simulates job processing for demo mode
- **AIProfileExtractor**: Uses OpenAI for intelligent profile data extraction
- **LinkedInService**: Manages LinkedIn OAuth and API interactions
- **JobQueue**: Orchestrates batch profile processing with retry logic
- **DependencyContainer**: Manages service dependencies and initialization

### Authentication & Authorization
- LinkedIn OAuth 2.0 integration for API access
- Mock authentication system for development
- Token refresh handling for long-running jobs

### File Processing Pipeline
1. Excel file upload and validation (50MB limit, .xlsx/.xls formats)
2. LinkedIn URL extraction from spreadsheets
3. Batch job creation with configurable batch sizes
4. Queue-based processing with retry logic
5. Results export to Excel format

### Job Queue System
- In-memory job queue with pause/resume functionality
- Configurable batch processing (default 50 profiles)
- Error categorization (CAPTCHA, access restricted, not found)
- Real-time progress tracking and ETA calculation
- Automatic retry mechanism for failed profiles

## Data Flow

1. **File Upload**: User uploads Excel file → Server validates and parses LinkedIn URLs
2. **Job Creation**: URLs are batched into processing jobs → Job queue manages execution
3. **LinkedIn API**: Authenticated requests extract profile data → Results stored in database
4. **Progress Tracking**: Real-time updates via polling → UI displays processing status
5. **Results Export**: Completed jobs can be downloaded as Excel files

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@radix-ui/***: Headless UI components
- **@tanstack/react-query**: Server state management
- **xlsx**: Excel file processing
- **multer**: File upload handling

### LinkedIn Integration
- OAuth 2.0 authentication flow
- Profile API access with rate limiting
- Proxy support for IP rotation (configurable)

### Development Tools
- **Vite**: Build tool with HMR and development server
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production build optimization

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR on port 5173
- **Backend**: Express server on port 5000 with tsx for TypeScript execution
- **Database**: Neon PostgreSQL with connection pooling
- **File Storage**: Local uploads directory

### Production Build
- **Frontend**: Static assets built to `dist/public`
- **Backend**: Bundled with ESBuild to `dist/index.js`
- **Database**: Migrations handled via Drizzle Kit
- **Environment**: Node.js with ES modules

### Configuration
- Database URL via `DATABASE_URL` environment variable
- LinkedIn credentials via environment variables
- File upload limits and batch sizes configurable
- Proxy settings for LinkedIn API access

The application follows a monorepo structure with shared TypeScript types and schema definitions between frontend and backend, ensuring type safety across the entire stack.