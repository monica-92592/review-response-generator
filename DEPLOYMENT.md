# Deployment Guide

This document provides comprehensive instructions for deploying the AI Review Response Generator to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Deployment Options](#deployment-options)
5. [Production Deployment](#production-deployment)
6. [Monitoring and Health Checks](#monitoring-and-health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)

## Prerequisites

### Required Tools
- Node.js 18+ and npm
- Git
- Docker and Docker Compose (for containerized deployment)
- Vercel CLI (for Vercel deployment)

### Required Accounts
- GitHub account (for CI/CD)
- Vercel account (for hosting)
- OpenAI API account
- Anthropic API account
- Optional: Redis hosting (Upstash, Redis Cloud, etc.)

### Required Environment Variables
```bash
# AI Provider Configuration
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Security Configuration
ENCRYPTION_KEY=your-32-byte-encryption-key
ALLOWED_ORIGINS=https://your-domain.com

# Application Configuration
NEXT_PUBLIC_APP_NAME="AI Review Response Generator"
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Environment Setup

### 1. Development Environment

```bash
# Clone the repository
git clone https://github.com/your-username/review-response-generator.git
cd review-response-generator

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Edit environment variables
nano .env.local

# Start development server
npm run dev
```

### 2. Staging Environment

```bash
# Copy staging environment template
cp env.staging .env.staging.local

# Edit staging environment variables
nano .env.staging.local

# Deploy to staging
./scripts/deploy.sh staging
```

### 3. Production Environment

```bash
# Copy production environment template
cp env.production .env.production.local

# Edit production environment variables
nano .env.production.local

# Deploy to production
./scripts/deploy.sh production
```

## CI/CD Pipeline

### GitHub Actions Workflow

The project includes a comprehensive CI/CD pipeline in `.github/workflows/ci-cd.yml`:

1. **Test Job**: Runs linting, unit tests, integration tests, and E2E tests
2. **Build Job**: Builds the application for production
3. **Security Scan**: Runs security audits and vulnerability scans
4. **Deploy to Staging**: Deploys to staging on pushes to `develop` branch
5. **Deploy to Production**: Deploys to production on pushes to `main` branch

### Required GitHub Secrets

Set these secrets in your GitHub repository settings:

```bash
# AI Provider Keys
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Security Keys
ENCRYPTION_KEY=your-32-byte-encryption-key
ALLOWED_ORIGINS=https://your-domain.com

# Vercel Configuration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Test Environment
TEST_OPENAI_API_KEY=sk-test-openai-key
TEST_ANTHROPIC_API_KEY=sk-ant-test-key
TEST_ENCRYPTION_KEY=test-encryption-key

# Staging Environment
STAGING_OPENAI_API_KEY=sk-staging-openai-key
STAGING_ANTHROPIC_API_KEY=sk-ant-staging-key
STAGING_ENCRYPTION_KEY=staging-encryption-key
STAGING_ALLOWED_ORIGINS=https://staging.your-domain.com

# Monitoring
SNYK_TOKEN=your-snyk-token
SLACK_WEBHOOK_URL=your-slack-webhook-url
PRODUCTION_URL=https://your-production-domain.com
```

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the application
npm run build

# Deploy using the deployment script
./scripts/deploy.sh [environment] [version]
```

## Deployment Options

### 1. Vercel Deployment (Recommended)

Vercel provides the easiest deployment option with automatic scaling and global CDN.

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Configuration
The `vercel.json` file includes:
- Security headers
- CORS configuration
- Function timeout settings
- Regional deployment settings

### 2. Docker Deployment

For containerized deployment with full control over infrastructure.

#### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

#### Production Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Scale application
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Monitor services
docker-compose -f docker-compose.prod.yml ps
```

### 3. Traditional Server Deployment

For deployment on traditional servers or VPS.

#### Prerequisites
- Ubuntu 20.04+ or CentOS 8+
- Nginx
- Node.js 18+
- Redis
- SSL certificate

#### Setup
```bash
# Install dependencies
sudo apt update
sudo apt install nginx redis-server nodejs npm

# Clone repository
git clone https://github.com/your-username/review-response-generator.git
cd review-response-generator

# Install application dependencies
npm ci --only=production

# Build application
npm run build

# Setup environment variables
cp env.production .env.production.local
nano .env.production.local

# Setup Nginx
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx

# Setup PM2 for process management
npm install -g pm2
pm2 start npm --name "review-generator" -- start
pm2 startup
pm2 save
```

## Production Deployment

### Pre-deployment Checklist

- [ ] All tests pass
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups created
- [ ] Monitoring configured
- [ ] Rollback plan prepared

### Deployment Steps

1. **Create Release Branch**
   ```bash
   git checkout -b release/v1.0.0
   git push origin release/v1.0.0
   ```

2. **Run Pre-deployment Tests**
   ```bash
   npm run test:coverage
   npm run test:e2e
   npm audit --audit-level=moderate
   ```

3. **Deploy to Staging**
   ```bash
   ./scripts/deploy.sh staging
   ```

4. **Verify Staging Deployment**
   - Check health endpoint: `https://staging.your-domain.com/health`
   - Run smoke tests
   - Verify all functionality

5. **Deploy to Production**
   ```bash
   git checkout main
   git merge release/v1.0.0
   git push origin main
   # CI/CD will automatically deploy to production
   ```

6. **Post-deployment Verification**
   - Monitor application logs
   - Check health endpoint
   - Verify all features work
   - Monitor error rates

### Rollback Procedure

If deployment fails:

```bash
# Rollback to previous version
./scripts/deploy.sh production [previous-version]

# Or use Vercel rollback
vercel rollback

# Check application health
curl https://your-domain.com/health
```

## Monitoring and Health Checks

### Health Check Endpoint

The application provides a health check endpoint at `/api/health`:

```bash
curl https://your-domain.com/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600,
  "memory": {
    "rss": 123456789,
    "heapTotal": 987654321,
    "heapUsed": 123456789,
    "external": 12345
  },
  "checks": {
    "api": "healthy",
    "database": "healthy",
    "redis": "healthy",
    "external_apis": "healthy"
  },
  "responseTime": 45
}
```

### Monitoring Setup

1. **Error Monitoring**
   - Configure Sentry DSN in environment variables
   - Monitor error rates and performance

2. **Application Performance Monitoring**
   - Use Vercel Analytics or similar service
   - Monitor API response times
   - Track user interactions

3. **Infrastructure Monitoring**
   - Monitor server resources (CPU, memory, disk)
   - Set up alerts for high resource usage
   - Monitor Redis and database performance

### Logging

The application includes comprehensive logging:

```bash
# View application logs
docker-compose logs -f app

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
journalctl -u nginx -f
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify environment variables
   npm run build
   # Check for missing variables in build output
   ```

3. **API Connectivity Issues**
   ```bash
   # Test API connectivity
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models
   ```

4. **Rate Limiting Issues**
   ```bash
   # Check rate limit configuration
   # Verify Redis connection
   redis-cli ping
   ```

5. **SSL Certificate Issues**
   ```bash
   # Test SSL configuration
   openssl s_client -connect your-domain.com:443
   ```

### Performance Issues

1. **High Memory Usage**
   - Monitor memory usage with `htop`
   - Check for memory leaks
   - Consider increasing server memory

2. **Slow Response Times**
   - Check database query performance
   - Monitor external API response times
   - Consider caching strategies

3. **High CPU Usage**
   - Monitor CPU usage patterns
   - Check for infinite loops or heavy computations
   - Consider scaling horizontally

## Security Considerations

### Environment Variables
- Never commit sensitive environment variables to version control
- Use different API keys for different environments
- Rotate API keys regularly

### SSL/TLS
- Always use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS headers

### Rate Limiting
- Implement rate limiting on all API endpoints
- Monitor for abuse patterns
- Set appropriate limits for different endpoints

### Input Validation
- Validate all user inputs
- Sanitize data before processing
- Implement proper error handling

### Monitoring
- Monitor for security events
- Set up alerts for suspicious activity
- Log security-related events

### Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Apply security patches promptly

## Support

For deployment issues:

1. Check the troubleshooting section above
2. Review application logs
3. Check GitHub Issues for known problems
4. Contact the development team

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/) 