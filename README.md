# LinkedAgent: High-Volume LinkedIn Scraping Platform

LinkedAgent is a scalable LinkedIn scraping and automation platform built with modern microservices architecture. It processes up to 10,000 LinkedIn profiles per batch, transforming URLs into enriched Excel outputs ready for CRM import.

![LinkedAgent Dashboard](https://via.placeholder.com/800x400/0A66C2/FFFFFF?text=LinkedAgent+Dashboard)

## 🚀 Features

- **High-Volume Processing**: Handle up to 10,000 LinkedIn profiles per batch
- **Real-Time Monitoring**: Live job progress tracking with WebSocket updates
- **Intelligent Retry Logic**: Exponential backoff and error handling
- **Proxy Rotation**: Built-in IP management for reliable scraping
- **Multi-Tenant Support**: Enterprise-grade access control
- **CRM-Ready Exports**: Excel files optimized for CRM import
- **Professional UI**: LinkedIn-inspired design with dark mode support

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Node.js API   │    │  Python Scrapers │
│   (Vite + TS)   │◄──►│  (Express/tRPC) │◄──►│   (Playwright)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   BullMQ Queue  │◄─────────────┘
                        │   (Redis)       │
                        └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** + **ShadCN/UI** for styling
- **React Router** for navigation
- **Recharts** for analytics visualization

### Backend (Planned)
- **Node.js** with Express or Fastify
- **BullMQ** for job queue management
- **Redis** for caching and queues
- **MySQL/PostgreSQL** with Prisma ORM
- **Docker** for containerization

### Testing & Quality
- **Vitest** for unit testing
- **Testing Library** for component testing
- **ESLint** + **TypeScript** for code quality
- **GitHub Actions** for CI/CD

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/linkedagent.git
   cd linkedagent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   VITE_API_BASE_URL=https://api.linkedagent.com/v1
   VITE_USE_MOCK_API=true  # Set to false for production
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Login

The application runs in demo mode by default. Use any email/password combination to login and explore the features.

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:ui
```

### Run Linting
```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Type checking
npm run type-check
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🚀 Deployment

### Environment Variables

Create appropriate environment files for each environment:

**Staging (.env.staging)**
```env
VITE_API_BASE_URL=https://staging-api.linkedagent.com/v1
VITE_USE_MOCK_API=false
VITE_ENVIRONMENT=staging
```

**Production (.env.production)**
```env
VITE_API_BASE_URL=https://api.linkedagent.com/v1
VITE_USE_MOCK_API=false
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=your-sentry-dsn
```

### Deployment Options

#### Option 1: Static Hosting (Netlify, Vercel)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

#### Option 2: Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD [\"nginx\", \"-g\", \"daemon off;\"]
```

#### Option 3: AWS S3 + CloudFront

```bash
# Build and deploy to S3
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths \"/*\"
```

## 🔧 Configuration

### API Configuration

The application supports both mock and real API modes:

- **Mock Mode**: Perfect for development and testing
- **Real API Mode**: Connect to your backend API

### Feature Flags

Control features via environment variables:

```env
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_MULTI_TENANT=true
```

## 📊 Monitoring & Analytics

### Error Tracking

Integration with Sentry for production error monitoring:

```env
VITE_SENTRY_DSN=your-sentry-dsn
```

### Performance Monitoring

- Bundle size analysis with `npm run build`
- Lighthouse CI integration
- Core Web Vitals tracking

## 🔒 Security

### Best Practices Implemented

- **JWT Authentication** with secure token storage
- **HTTPS Enforcement** in production
- **Content Security Policy** headers
- **Dependency Vulnerability Scanning**
- **Environment Variable Validation**

### Security Checklist

- [ ] API keys stored securely (not in frontend)
- [ ] HTTPS enabled in production
- [ ] Regular dependency updates
- [ ] Security headers configured
- [ ] Input validation on all forms

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Write tests for new features
- Update documentation as needed

## 📈 Roadmap

### Phase 1: Frontend Foundation ✅
- [x] React application with TypeScript
- [x] Professional UI with ShadCN components
- [x] Mock API integration
- [x] Comprehensive testing setup
- [x] CI/CD pipeline

### Phase 2: Backend Integration (In Progress)
- [ ] Node.js API with Express/Fastify
- [ ] BullMQ job queue implementation
- [ ] Database schema and migrations
- [ ] Authentication and authorization

### Phase 3: Scraping Engine
- [ ] Python scraper with Playwright
- [ ] Proxy rotation system
- [ ] Rate limiting and retry logic
- [ ] Data enrichment pipeline

### Phase 4: Production Features
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant architecture
- [ ] API rate limiting
- [ ] Comprehensive monitoring

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guide](docs/contributing.md)

### Getting Help
- 📧 Email: support@linkedagent.com
- 💬 Discord: [Join our community](https://discord.gg/linkedagent)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/linkedagent/issues)

### Professional Services
For enterprise deployments, custom integrations, or professional support, contact our team at enterprise@linkedagent.com.

---

**Built with ❤️ by the LinkedAgent team**